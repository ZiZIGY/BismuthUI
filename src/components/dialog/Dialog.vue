<script setup lang="ts">
  import { onBeforeUnmount, useTemplateRef, watch } from 'vue';
  import { onKeyStroke, useScrollLock } from '@vueuse/core';
  import { useFocusTrap } from './useFocusTrap';
  import type { IDialogProps } from '.';

  defineOptions({ name: 'BDialog', inheritAttrs: false });

  /**
   * The machinery of a window over the page, on a div rather than a native
   * `<dialog>`.
   *
   * `showModal` gave the top layer, a trapped focus, Escape and an inert
   * background for free — but the top layer is a compositor concept, and a
   * frameless Electron window does not always agree with it: a custom
   * titlebar drawn as its own `-webkit-app-region: drag` region can end up
   * above or below the top layer inconsistently across platforms, and there
   * is nothing on this side of the page that can reach in and fix it. A div
   * has no top layer to disagree with; it stacks by an ordinary `z-index`,
   * which is what lets a host application put it exactly where its own chrome
   * needs it, and fix the rest itself.
   *
   * Everything the top layer used to give away is written out by hand:
   * `useFocusTrap` holds the keyboard inside while open and hands it back on
   * close, Escape is read here directly, and every other child of `<body>` is
   * marked `inert` for as long as this one is open — a native dialog does the
   * same to the whole document, and a div reaching only as far as its
   * siblings is the closest an ordinary element can come. A sibling carrying
   * `data-b-dialog-keep` is skipped: that is the host's own chrome — a custom
   * titlebar, a toast rail — which the top layer used to hide and which a div
   * is meant to let through.
   *
   * Teleported to `body` regardless. A fixed position is undone by a
   * transformed, filtered or contained ancestor, and teleporting is what
   * keeps this from depending on there being none between here and the root.
   *
   * Opening and closing are left to CSS, exactly as before: `display`
   * transitions with `allow-discrete` on the outer box, so it stays in the
   * layout for as long as it takes the two children to fade, and `close()`
   * does not cut it from the page on the frame it was told to.
   */
  const props = withDefaults(defineProps<IDialogProps>(), {
    dismissible: true,
  });

  const open = defineModel<boolean>('open', { default: false });

  const root = useTemplateRef<HTMLElement>('root');
  const viewport = useTemplateRef<HTMLElement>('viewport');

  useFocusTrap(viewport, open);

  /*
   * `showModal` made the page inert but not still: the wheel goes on turning
   * whatever is behind the window. In SSR there is no body to hold, hence the
   * guard rather than a bare `document.body`.
   */
  const locked = useScrollLock(globalThis.document?.body ?? null);

  /*
   * Marked rather than merely toggled: a second dialog opening while this one
   * is still open would otherwise lift the inert off it again the moment the
   * second one closes, since each is a body child to the other. Only what an
   * instance inerted itself is ever the one to hand back.
   */
  function setBackgroundInert(value: boolean) {
    if (!root.value || !globalThis.document) return;

    for (const child of Array.from(document.body.children)) {
      if (child === root.value) continue;
      /* the host's chrome stays live over the window; stacking it is the host's job */
      if (child.hasAttribute('data-b-dialog-keep')) continue;

      if (value && !child.hasAttribute('inert')) {
        child.setAttribute('inert', '');
        child.setAttribute('data-b-dialog-inert', '');
      } else if (!value && child.hasAttribute('data-b-dialog-inert')) {
        child.removeAttribute('inert');
        child.removeAttribute('data-b-dialog-inert');
      }
    }
  }

  watch(open, (value) => {
    locked.value = value;
    setBackgroundInert(value);
  });

  /*
   * Unmounted while open — a host that keeps the window in the tree only for
   * as long as it is open (`v-if`) — would leave every sibling inert and the
   * scroll locked: the watcher above never sees that close. A native `<dialog>`
   * dropped its modality together with the element; this does the same by
   * hand, while `root` is still in the document to be skipped.
   */
  onBeforeUnmount(() => {
    if (!open.value) return;
    locked.value = false;
    setBackgroundInert(false);
  });

  /*
   * Not gated by `dismissible`: a press outside is optional, Escape is not.
   * A host that already handled the key — `preventDefault` on capture, the
   * way a native `<dialog>` would have been told not to cancel — keeps its
   * decision; the window closes only on an Escape nobody else claimed.
   */
  onKeyStroke('Escape', (event) => {
    if (event.defaultPrevented) return;
    if (open.value) open.value = false;
  });

  function close() {
    open.value = false;
  }

  /*
   * The viewport covers the whole screen and flex-centres whatever is put in
   * it, so a press landing on the viewport itself rather than on a descendant
   * is a press in the empty gutter around the panel — outside it.
   */
  function onPress(event: MouseEvent) {
    if (props.dismissible && event.target === viewport.value) close();
  }
</script>

<template>
  <Teleport to="body">
    <div
      ref="root"
      class="b-dialog"
      :class="{ 'b-dialog--open': open }"
    >
      <div
        class="b-dialog__backdrop"
        aria-hidden="true"
      />

      <div
        ref="viewport"
        v-bind="$attrs"
        class="b-dialog__viewport"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        tabindex="-1"
        @click="onPress"
      >
        <slot :close />
      </div>
    </div>
  </Teleport>
</template>

<style>
  :where(.b-dialog) {
    --dialog-inset: 1.5rem;
    --dialog-z: 1000;

    position: fixed;
    inset: 0;
    z-index: var(--dialog-z);
    display: none;
    transition: display 0.2s allow-discrete;
  }

  .b-dialog--open {
    display: block;
  }

  /*
   * Custom properties do not reach every backdrop-adjacent context the same
   * way a browser's own `::backdrop` colour would, so the variable is the
   * first choice and a plain colour sits behind it — a backdrop that failed
   * to resolve its colour would be no backdrop.
   */
  .b-dialog__backdrop {
    position: absolute;
    inset: 0;
    background: var(--dialog-backdrop, rgb(6 5 10 / 0.62));
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .b-dialog--open .b-dialog__backdrop {
    opacity: 1;
  }

  @starting-style {
    .b-dialog--open .b-dialog__backdrop {
      opacity: 0;
    }
  }

  /*
   * Scaled and faded as a whole rather than leaving the caller's own panel to
   * animate itself: this box is the full screen, flex-centring whatever sits
   * inside it, so shrinking the box by a hair around its centre reads as the
   * panel growing in — without this component ever having to reach into
   * content it does not own.
   */
  .b-dialog__viewport {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--dialog-inset);
    color: var(--b-text);
    opacity: 0;
    transform: scale(0.97);
    outline: none;
    transition:
      opacity 0.2s ease,
      transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
  }

  .b-dialog--open .b-dialog__viewport {
    opacity: 1;
    transform: scale(1);
  }

  @starting-style {
    .b-dialog--open .b-dialog__viewport {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-dialog {
      transition: display 0s allow-discrete;
    }

    .b-dialog__backdrop {
      transition: opacity 0s ease;
    }

    .b-dialog__viewport {
      transition: opacity 0s ease;
      transform: none;
    }
  }
</style>
