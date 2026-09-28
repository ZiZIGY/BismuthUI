<script setup lang="ts">
  import { onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue';
  import BTooltipBubble from './TooltipBubble.vue';
  import type { ITooltipProps } from '.';

  defineOptions({ name: 'BTooltip' });

  /**
   * The slider's bubble, generalised: a plate wearing the frame with a tail cut
   * into its own contour, faded and grown into place. What the bubble never had
   * to do is stand anywhere but above a handle it already knew the position of
   * — this one is asked to sit next to an arbitrary trigger, so the tail can
   * point any of four ways and the box has to be measured rather than laid out
   * in CSS alone.
   *
   * What stays here is the trigger and the decision to show; the box and
   * everything that places it is `BTooltipBubble`, mounted only while shown.
   * `<Transition>` puts it in the page on the way in and takes it out once it
   * has faded, so a page of tooltips is a page of triggers and four listeners
   * each on elements of their own — nothing on the window, nothing observed.
   *
   * Teleported to `body` for the same reason `BDialog` is: an ancestor that
   * clips, transforms or scrolls would otherwise cut a fixed-position box off
   * or carry it away from the trigger it is meant to sit beside.
   *
   * Non-interactive throughout — `pointer-events: none` always, not merely
   * before it shows the way the bubble's does. The bubble sits over dead space
   * inside its own component; this floats over whatever the page happens to
   * have underneath it, and must never be the thing a click or a hover lands
   * on instead.
   */
  const props = withDefaults(defineProps<ITooltipProps>(), {
    placement: 'auto',
    delay: 300,
  });

  const open = ref(false);
  const id = useId();

  const trigger = useTemplateRef<HTMLElement>('trigger');

  let timer: ReturnType<typeof setTimeout> | undefined;

  function show() {
    if (props.disabled) return;
    clearTimeout(timer);
    timer = setTimeout(() => (open.value = true), props.delay);
  }

  function hide() {
    clearTimeout(timer);
    open.value = false;
  }

  watch(
    () => props.disabled,
    (value) => {
      if (value) hide();
    }
  );

  onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <span
    ref="trigger"
    class="b-tooltip"
    :aria-describedby="open ? id : undefined"
    @pointerenter="show"
    @pointerleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot name="trigger" />

    <Teleport to="body">
      <Transition name="b-tooltip">
        <BTooltipBubble
          v-if="open && trigger"
          :id
          :trigger
          :placement
        >
          <slot />
        </BTooltipBubble>
      </Transition>
    </Teleport>
  </span>
</template>

<style>
  :where(.b-tooltip) {
    display: inline-block;
  }
</style>
