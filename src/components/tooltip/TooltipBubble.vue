<script setup lang="ts">
  import { toRef, useTemplateRef } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import { usePlacement } from './usePlacement';
  import type { ITooltipBubbleProps } from '.';

  defineOptions({ name: 'BTooltipBubble' });

  /**
   * What `BTooltip` shows, cut out of it so that everything placing the box
   * lives and dies with the box. Mounted only while the tooltip is open, its
   * observers, its window listener and its per-frame read of the trigger
   * exist for exactly as long as there is something on screen to put
   * somewhere — the way Reka splits a popper's content from its root, and for
   * the same reason.
   *
   * On its way out it is already unmounted: `<Transition>` keeps the element
   * for the fade, but nothing patches it any more, so it fades where it
   * stood rather than chasing a trigger it no longer belongs to.
   */
  const props = defineProps<ITooltipBubbleProps>();

  const panel = useTemplateRef<HTMLElement>('panel');

  const { side, style } = usePlacement(
    toRef(props, 'trigger'),
    panel,
    toRef(props, 'placement')
  );
</script>

<template>
  <span
    ref="panel"
    class="b-tooltip__bubble"
    :data-side="side"
    role="tooltip"
    :style
  >
    <BFrame
      :band="false"
      :glow="false"
    />

    <span class="b-tooltip__bubble-text">
      <slot />
    </span>
  </span>
</template>

<style>
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
    pointer-events: none;
  }

  .b-tooltip-enter-active,
  .b-tooltip-leave-active {
    transition:
      opacity 0.16s ease,
      transform 0.16s cubic-bezier(0.2, 0.8, 0.3, 1);
  }

  .b-tooltip-enter-from,
  .b-tooltip-leave-to {
    opacity: 0;
  }

  /* grown in from a few pixels back the way it came, the bubble's own move */
  .b-tooltip-enter-from[data-side='top'],
  .b-tooltip-leave-to[data-side='top'] {
    transform: translateY(4px) scale(0.94);
  }

  .b-tooltip-enter-from[data-side='bottom'],
  .b-tooltip-leave-to[data-side='bottom'] {
    transform: translateY(-4px) scale(0.94);
  }

  .b-tooltip-enter-from[data-side='left'],
  .b-tooltip-leave-to[data-side='left'] {
    transform: translateX(4px) scale(0.94);
  }

  .b-tooltip-enter-from[data-side='right'],
  .b-tooltip-leave-to[data-side='right'] {
    transform: translateX(-4px) scale(0.94);
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
    .b-tooltip-enter-active,
    .b-tooltip-leave-active {
      transition: opacity 0.16s ease;
    }

    .b-tooltip-enter-from[data-side],
    .b-tooltip-leave-to[data-side] {
      transform: none;
    }
  }
</style>
