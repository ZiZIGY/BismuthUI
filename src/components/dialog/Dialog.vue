<script setup lang="ts">
  import { useTemplateRef, watch } from 'vue';
  import { useScrollLock } from '@vueuse/core';
  import type { IDialogProps } from '.';

  defineOptions({ name: 'BDialog', inheritAttrs: false });

  /**
   * The machinery of a window over the page, and nothing about how one looks.
   * What goes in the slot is the caller's own box, dressed however they like;
   * `close` is handed to it, so a button inside needs nothing from anywhere
   * else.
   *
   * A real `<dialog>`, opened with `showModal`, and that is the whole of why
   * there is so little here. The top layer puts it over every stacking context
   * on the page, so no z-index has to be guessed at; the focus is trapped
   * inside and handed back to whatever had it when the window closes; Escape
   * works; and the rest of the document goes inert, which is a thing that
   * cannot be faked convincingly with a div.
   *
   * Teleported all the same, to `body`. The top layer already frees it from a
   * clipping or transformed ancestor, so this is not what makes it float — it
   * is so the element sits somewhere predictable whatever it was written
   * inside, which is what a portal is actually for.
   *
   * Opening and closing are left to CSS. `display` and `overlay` are carried
   * across with `allow-discrete`, so the window stays in the top layer for as
   * long as it takes to fade out — without that pair, `close()` would cut it
   * from the page on the frame it was told to, and there would be nothing left
   * to animate.
   */
  const props = withDefaults(defineProps<IDialogProps>(), {
    dismissible: true,
  });

  const open = defineModel<boolean>('open', { default: false });

  const dialog = useTemplateRef<HTMLDialogElement>('dialog');

  /*
   * `showModal` makes the page inert but not still: the wheel goes on turning
   * whatever is behind the window. In SSR there is no body to hold, hence the
   * guard rather than a bare `document.body`.
   */
  const locked = useScrollLock(globalThis.document?.body ?? null);

  watch(open, (value) => {
    locked.value = value;

    if (value) dialog.value?.showModal();
    else dialog.value?.close();
  });

  function close() {
    open.value = false;
  }

  /*
   * The backdrop belongs to the dialog element, so a press on it lands here
   * rather than on anything of ours — which is what makes `self` the test for
   * "outside the window".
   */
  function onPress(event: MouseEvent) {
    if (props.dismissible && event.target === dialog.value) close();
  }
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      v-bind="$attrs"
      class="b-dialog"
      :aria-label="label"
      @close="open = false"
      @click="onPress"
    >
      <slot :close />
    </dialog>
  </Teleport>
</template>

<style>
  :where(.b-dialog) {
    --dialog-inset: 1.5rem;

    /*
     * Everything but `display` is stated here rather than on `[open]`, and
     * that is not tidiness. On the way out only `display` is carried across —
     * every other declaration written against `[open]` stops matching the
     * instant the attribute goes, so a centring put there would be dropped
     * mid-fade and the window would spend its last fifth of a second in the
     * top-left corner, stretched to the height of the screen.
     *
     * The element is the whole viewport rather than the window itself: a press
     * on the empty part of it is a press outside, which is what `dismissible`
     * listens for, and the backdrop is left to do nothing but darken.
     */
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: var(--dialog-inset);
    color: var(--b-text);
    background: transparent;
    border: 0;
    opacity: 0;
    transform: scale(0.97);
    transition:
      opacity 0.2s ease,
      transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1),
      overlay 0.2s allow-discrete,
      display 0.2s allow-discrete;
  }

  /*
   * `display` is stated on `[open]` and nowhere else. Put on the bare element
   * it would beat the browser's `display: none` and leave the window on screen
   * while it is shut.
   */
  .b-dialog[open] {
    display: flex;
    opacity: 1;
    transform: scale(1);
  }

  @starting-style {
    .b-dialog[open] {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  /*
   * Custom properties do not reach a backdrop everywhere yet, so the colour is
   * written out with the variable as the first choice and a plain one behind
   * it — a backdrop that failed to resolve its colour would be no backdrop.
   */
  .b-dialog::backdrop {
    background: var(--dialog-backdrop, rgb(6 5 10 / 0.62));
    opacity: 0;
    transition:
      opacity 0.2s ease,
      overlay 0.2s allow-discrete,
      display 0.2s allow-discrete;
  }

  .b-dialog[open]::backdrop {
    opacity: 1;
  }

  @starting-style {
    .b-dialog[open]::backdrop {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-dialog,
    .b-dialog::backdrop {
      transition:
        overlay 0s allow-discrete,
        display 0s allow-discrete;
    }
  }
</style>
