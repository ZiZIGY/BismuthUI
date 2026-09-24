<script setup lang="ts">
  import { onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import { usePlacement } from './usePlacement';
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
  const panel = useTemplateRef<HTMLElement>('panel');

  const placement = ref(props.placement);
  watch(() => props.placement, (value) => (placement.value = value));

  const { side, style } = usePlacement(trigger, panel, placement);

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
      <span
        :id="id"
        ref="panel"
        class="b-tooltip__bubble"
        :class="{ 'b-tooltip__bubble--open': open }"
        :data-side="side"
        role="tooltip"
        :style="style"
      >
        <BFrame
          :band="false"
          :glow="false"
        />

        <span class="b-tooltip__bubble-text">
          <slot />
        </span>
      </span>
    </Teleport>
  </span>
</template>

<style>
  :where(.b-tooltip) {
    display: inline-block;
  }

  :where(.b-tooltip__bubble) {
    --bubble-height: 28px;
    --bubble-tail: 6px;

    --frame-slant: calc(var(--bubble-height) / 2);
    --frame-line: var(--b-line);
    --frame-fill: var(--b-elevated);
  }

  /*
   * Fixed rather than absolute: teleported to `body`, there is no positioned
   * ancestor of its own left to be absolute against, and `top`/`left` are
   * viewport coordinates either way — exactly what `getBoundingClientRect`,
   * behind `usePlacement`, already hands back.
   */
  .b-tooltip__bubble {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--tooltip-z, 1000);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: calc(var(--bubble-height) * 1.4);
    height: var(--bubble-height);
    padding-inline: calc(var(--bubble-height) * 0.6);
    opacity: 0;
    /*
     * `visibility` rather than `display: none`: a box that is never rendered
     * can never be measured, and `usePlacement` needs this element's own size
     * at every moment, not just once it is finally shown. Kept laid out and
     * merely invisible, it stays measurable throughout — no first-frame flash
     * at the wrong size, no `nextTick` to wait out.
     */
    visibility: hidden;
    pointer-events: none;
    transform: scale(0.94);
    transition:
      opacity 0.16s ease,
      transform 0.16s cubic-bezier(0.2, 0.8, 0.3, 1),
      visibility 0s linear 0.16s;
  }

  /*
   * `transform` is left to the per-side rules further down: `[data-side]` is
   * always present once mounted, so a value written here would only ever be
   * the one those rules override — stating it twice invites the two to drift.
   */
  .b-tooltip__bubble--open {
    opacity: 1;
    visibility: visible;
    transition:
      opacity 0.16s ease,
      transform 0.16s cubic-bezier(0.2, 0.8, 0.3, 1),
      visibility 0s;
  }

  /* grown in from a few pixels back the way it came, the bubble's own move */
  .b-tooltip__bubble[data-side='top'] {
    transform: translateY(4px) scale(0.94);
  }

  .b-tooltip__bubble[data-side='bottom'] {
    transform: translateY(-4px) scale(0.94);
  }

  .b-tooltip__bubble[data-side='left'] {
    transform: translateX(4px) scale(0.94);
  }

  .b-tooltip__bubble[data-side='right'] {
    transform: translateX(-4px) scale(0.94);
  }

  .b-tooltip__bubble--open[data-side] {
    transform: translate(0, 0) scale(1);
  }

  /*
   * The tail, carried over from the slider's bubble: a square turned 45deg
   * with two of its four borders drawn, pulled in from the edge it sits on by
   * a stroke's width less a pixel so it overlaps and erases the frame's own
   * line rather than sitting beside it.
   *
   * Which two borders, and which edge, is the one thing that changes with the
   * side. A square rotated 45deg sends its top-left corner up, its top-right
   * right, its bottom-right down and its bottom-left left — so the pair of
   * borders sharing a corner is the pair that makes the tail point that way:
   * bottom+right for a tail pointing down, top+left for one pointing up, and
   * so on. A tooltip above its trigger needs a tail pointing down at it, so it
   * takes the same pair the bubble already uses; the other three sides are
   * that same derivation turned to face the trigger from wherever they stand.
   */
  .b-tooltip__bubble::after {
    content: '';
    position: absolute;
    width: var(--bubble-tail);
    height: var(--bubble-tail);
    background: var(--b-elevated);
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .b-tooltip__bubble[data-side='top']::after {
    top: calc(100% - var(--b-stroke, 1.4px) + 1px);
    left: 50%;
    border-right: var(--b-stroke, 1.4px) solid var(--b-line);
    border-bottom: var(--b-stroke, 1.4px) solid var(--b-line);
  }

  .b-tooltip__bubble[data-side='bottom']::after {
    top: calc(var(--b-stroke, 1.4px) - 1px);
    left: 50%;
    border-top: var(--b-stroke, 1.4px) solid var(--b-line);
    border-left: var(--b-stroke, 1.4px) solid var(--b-line);
  }

  .b-tooltip__bubble[data-side='left']::after {
    top: 50%;
    left: calc(100% - var(--b-stroke, 1.4px) + 1px);
    border-top: var(--b-stroke, 1.4px) solid var(--b-line);
    border-right: var(--b-stroke, 1.4px) solid var(--b-line);
  }

  .b-tooltip__bubble[data-side='right']::after {
    top: 50%;
    left: calc(var(--b-stroke, 1.4px) - 1px);
    border-left: var(--b-stroke, 1.4px) solid var(--b-line);
    border-bottom: var(--b-stroke, 1.4px) solid var(--b-line);
  }

  /* over the frame, which is positioned and would otherwise paint across it */
  .b-tooltip__bubble-text {
    position: relative;
    color: var(--b-text);
    font-size: calc(var(--bubble-height) * 0.46);
    line-height: 1;
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .b-tooltip__bubble {
      transition:
        opacity 0.16s ease,
        visibility 0s linear 0.16s;
      transform: none;
    }

    .b-tooltip__bubble--open {
      transition: opacity 0.16s ease;
    }
  }
</style>
