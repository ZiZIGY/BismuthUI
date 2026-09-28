<script setup lang="ts">
  import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
  import { onKeyStroke, useScrollLock } from '@vueuse/core';
  import { useFocusTrap } from './useFocusTrap';
  import type { IDialogProps } from '.';

  defineOptions({ name: 'BDialogWindow', inheritAttrs: false });

  /**
   * The open window, and everything a window being open means: the page held
   * still and inert behind it, the keyboard kept inside it, Escape heard on
   * the whole window. All of it is set up on mount and undone on unmount, and
   * `BDialog` mounts this only while open — so a closed dialog listens to
   * nothing and holds nothing, the way Reka's content is cut from its root.
   *
   * Every other child of `<body>` is marked `inert` while this is mounted — a
   * native dialog does the same to the whole document, and a div reaching
   * only as far as its siblings is the closest an ordinary element can come.
   * A sibling carrying `data-b-dialog-keep` is skipped: that is the host's
   * own chrome — a custom titlebar, a toast rail — which the top layer used
   * to hide and which a div is meant to let through.
   */
  const props = defineProps<IDialogProps>();

  const emit = defineEmits<{ close: [] }>();

  const root = useTemplateRef<HTMLElement>('root');
  const viewport = useTemplateRef<HTMLElement>('viewport');

  /*
   * `showModal` made the page inert but not still: the wheel goes on turning
   * whatever is behind the window. Released by the scroll lock itself when
   * this unmounts. In SSR there is no body to hold, hence the guard rather
   * than a bare `document.body`.
   */
  const locked = useScrollLock(globalThis.document?.body ?? null);
  locked.value = true;

  /*
   * Each instance keeps its own list of what it made inert, and hands back
   * exactly that. A shared marker would let a second dialog, closing, lift
   * the inert the first one is still relying on. Already-inert elements are
   * left off the list — they belong to someone else.
   */
  let inerted: Element[] = [];

  onMounted(() => {
    inerted = Array.from(document.body.children).filter(
      (child) =>
        child !== root.value &&
        !child.hasAttribute('inert') &&
        !child.hasAttribute('data-b-dialog-keep')
    );

    for (const child of inerted) child.setAttribute('inert', '');
  });

  onBeforeUnmount(() => {
    for (const child of inerted) child.removeAttribute('inert');
  });

  /*
   * After the background hooks, and the order is the point: on the way out
   * the page has to be live again before the focus is handed back to it — an
   * inert element does not take focus, and the hand-back would go nowhere.
   */
  useFocusTrap(viewport);

  /*
   * Not gated by `dismissible`: a press outside is optional, Escape is not.
   * A host that already handled the key — `preventDefault` on capture, the
   * way a native `<dialog>` would have been told not to cancel — keeps its
   * decision; the window closes only on an Escape nobody else claimed.
   */
  onKeyStroke('Escape', (event) => {
    if (!event.defaultPrevented) emit('close');
  });

  /*
   * The viewport covers the whole screen and flex-centres whatever is put in
   * it, so a press landing on the viewport itself rather than on a descendant
   * is a press in the empty gutter around the panel — outside it.
   */
  function onPress(event: MouseEvent) {
    if (props.dismissible && event.target === viewport.value) emit('close');
  }
</script>

<template>
  <div
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
      <slot />
    </div>
  </div>
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
