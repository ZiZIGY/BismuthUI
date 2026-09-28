<script setup lang="ts">
  import { releaseMotion } from '../../utils/releaseMotion';
  import BDialogWindow from './DialogWindow.vue';
  import type { IDialogProps } from '.';

  defineOptions({ name: 'BDialog', inheritAttrs: false });

  /**
   * A window over the page, on a div rather than a native `<dialog>`.
   *
   * `showModal` gave the top layer, a trapped focus, Escape and an inert
   * background for free — but the top layer is a compositor concept, and a
   * frameless Electron window does not always agree with it: a custom
   * titlebar drawn as its own `-webkit-app-region: drag` region can end up
   * above or below the top layer inconsistently across platforms, and there
   * is nothing on this side of the page that can reach in and fix it. A div
   * has no top layer to disagree with; it stacks by an ordinary `z-index`,
   * which is what lets a host application put it exactly where its own chrome
   * needs it, and fix the rest itself. What the top layer gave away is written
   * out by hand in `BDialogWindow`.
   *
   * This part only holds the flag. The window is mounted while open and
   * nothing else: `<Transition>` keeps it — contents and all — until its fade
   * has run, then takes it out of the page, so a closed dialog costs no DOM
   * and no listeners. That is also why content should not gate itself on
   * `open`: the flag drops the moment closing starts, and anything hanging off
   * it would vanish while the rest of the window is still fading.
   *
   * Teleported to `body`. A fixed position is undone by a transformed,
   * filtered or contained ancestor, and teleporting is what keeps this from
   * depending on there being none between here and the root.
   */
  withDefaults(defineProps<IDialogProps>(), {
    dismissible: true,
  });

  const open = defineModel<boolean>('open', { default: false });

  function close() {
    open.value = false;
  }
</script>

<template>
  <Teleport to="body">
    <Transition
      name="b-dialog"
      @after-leave="releaseMotion"
    >
      <BDialogWindow
        v-if="open"
        v-bind="$attrs"
        :label
        :dismissible
        @close="close"
      >
        <slot :close />
      </BDialogWindow>
    </Transition>
  </Teleport>
</template>
