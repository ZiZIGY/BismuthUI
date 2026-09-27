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
   * Mounted only while open. `<Transition>` holds the whole window — contents
   * and all — until its fade has run, then takes it out of the page, so a
   * closed dialog costs nothing and what it holds is built when it is first
   * shown. That is also why content should not gate itself on `open`: the
   * flag drops the moment closing starts, and anything hanging off it would
   * vanish while the rest of the window is still fading.
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
   * Each instance keeps its own list of what it made inert, and hands back
   * exactly that. A shared marker would let a second dialog, closing, lift
   * the inert the first one is still relying on. Already-inert elements are
   * left off the list — they belong to someone else.
   */
  let inerted: Element[] = [];

  function holdBackground() {
    inerted = Array.from(document.body.children).filter(
      (child) =>
        child !== root.value &&
        !child.hasAttribute('inert') &&
        /* the host's chrome stays live over the window; stacking it is the host's job */
        !child.hasAttribute('data-b-dialog-keep')
    );

    for (const child of inerted) child.setAttribute('inert', '');
  }

  function releaseBackground() {
    for (const child of inerted) child.removeAttribute('inert');
    inerted = [];
  }

  /* after the DOM update, or the window is not in the body yet to be skipped */
  watch(
    open,
    (value) => {
      locked.value = value;
      if (value) holdBackground();
      else releaseBackground();
    },
    { flush: 'post' }
  );

  /*
   * Unmounted while open — a host that keeps the window in the tree only for
   * as long as it is open (`v-if`) — would leave every sibling inert and the
   * scroll locked: the watcher above never sees that close. A native `<dialog>`
   * dropped its modality together with the element; this does the same by
   * hand.
   */
  onBeforeUnmount(() => {
    if (!open.value) return;
    locked.value = false;
    releaseBackground();
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
    <Transition name="b-dialog">
      <div
        v-if="open"
        ref="root"
        class="b-dialog"
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
    </Transition>
  </Teleport>
</template>

<style>
  :where(.b-dialog) {
    --dialog-inset: 1.5rem;
    --dialog-z: 1000;

    position: fixed;
    inset: 0;
    z-index: var(--dialog-z);
  }

  /*
   * The fade is on the whole window, backdrop and panel together, and it is
   * the one `<Transition>` times the exit by — it reads the durations of the
   * element it holds, not of its children. Faded as one group, the panel
   * also never shows the backdrop through itself halfway out.
   */
  .b-dialog-enter-active,
  .b-dialog-leave-active {
    transition: opacity 0.2s ease;
  }

  .b-dialog-enter-from,
  .b-dialog-leave-to {
    opacity: 0;
  }

  /* on its way out it is only a picture — a second press must not land */
  .b-dialog-leave-active {
    pointer-events: none;
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
  }

  /*
   * Scaled as a whole rather than leaving the caller's own panel to animate
   * itself: this box is the full screen, flex-centring whatever sits inside
   * it, so shrinking the box by a hair around its centre reads as the panel
   * growing in — without this component ever having to reach into content it
   * does not own.
   */
  .b-dialog__viewport {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--dialog-inset);
    color: var(--b-text);
    outline: none;
  }

  .b-dialog-enter-active .b-dialog__viewport,
  .b-dialog-leave-active .b-dialog__viewport {
    transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
  }

  .b-dialog-enter-from .b-dialog__viewport,
  .b-dialog-leave-to .b-dialog__viewport {
    transform: scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .b-dialog-enter-active,
    .b-dialog-leave-active,
    .b-dialog-enter-active .b-dialog__viewport,
    .b-dialog-leave-active .b-dialog__viewport {
      transition: none;
    }
  }
</style>
