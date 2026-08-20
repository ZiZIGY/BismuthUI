<script setup lang="ts">
  import {
    computed,
    ref,
    useTemplateRef,
    watchEffect,
    type CSSProperties,
  } from 'vue';
  import {
    useElementSize,
    useEventListener,
    useMutationObserver,
    useResizeObserver,
    useScroll,
  } from '@vueuse/core';
  import type { IScrollbarProps } from '.';

  defineOptions({ name: 'BScrollbar', inheritAttrs: false });

  /**
   * A bar for an element whose native one is hidden. It is a slider in all but
   * name: a rail with 45deg tips and a thumb of the same shape, dragged with
   * the pointer.
   *
   * The axis is the only difference between the two of them, so nothing below
   * assumes down: length, travel and the drag all ask which way they run.
   */
  const props = withDefaults(defineProps<IScrollbarProps>(), {
    axis: 'vertical',
  });

  /** Reported outwards, so a box can keep the gutter only while it is needed. */
  const overflowing = defineModel<boolean>('overflowing', { default: false });

  /** Shortest the thumb may get, px: below this it stops being grabbable. */
  const MINIMUM_THUMB = 24;

  const vertical = computed(() => props.axis === 'vertical');

  const scrollTarget = () => props.target ?? null;

  /*
   * Written instantly, whatever the box says. Scrolling is set to `smooth`
   * there so that a row reached with an arrow key glides into view, and a
   * dragged thumb must not go through that: the write would be animated, the
   * position read back straight after it would still be the old one, and the
   * thumb would follow the pointer in lurches.
   */
  const { x, y } = useScroll(scrollTarget, { behavior: 'instant' });

  const scrolled = computed({
    get: () => (vertical.value ? y.value : x.value),
    set: (value) => {
      if (vertical.value) y.value = value;
      else x.value = value;
    },
  });

  const viewportLength = ref(0);
  const contentLength = ref(0);

  /*
   * The viewport is taken from the limit the box may grow to, not from the
   * length it happens to have. While a list unfolds it is still short, and
   * measuring that would put a bar on screen for the length of the animation
   * and take it away again the moment the box reached its full size.
   */
  function measure() {
    const element = props.target;
    if (!element) return;

    const style = getComputedStyle(element);
    const limit = Number.parseFloat(
      vertical.value ? style.maxHeight : style.maxWidth
    );
    const content = vertical.value ? element.scrollHeight : element.scrollWidth;
    const box = vertical.value ? element.clientHeight : element.clientWidth;

    contentLength.value = content;
    viewportLength.value = Number.isFinite(limit)
      ? Math.min(content, limit)
      : box;
  }

  /* the box resizes on its own, the content changes when rows come and go */
  useResizeObserver(scrollTarget, measure);
  useMutationObserver(scrollTarget, measure, { childList: true, subtree: true });

  const rail = useTemplateRef<HTMLElement>('rail');
  const { width: railWidth, height: railHeight } = useElementSize(rail);

  const railLength = computed(() =>
    vertical.value ? railHeight.value : railWidth.value
  );

  /** How much of the content sits outside the viewport, px. */
  const overflow = computed(() =>
    Math.max(0, contentLength.value - viewportLength.value)
  );

  const thumbLength = computed(() => {
    if (!contentLength.value) return 0;
    const share = (viewportLength.value / contentLength.value) * railLength.value;
    return Math.max(MINIMUM_THUMB, share);
  });

  /** Range the thumb travels, px. Mirrors the overflow one to one. */
  const travel = computed(() => Math.max(0, railLength.value - thumbLength.value));

  const thumbStyle = computed<CSSProperties>(() => {
    const progress = overflow.value ? scrolled.value / overflow.value : 0;
    const shift = `${progress * travel.value}px`;

    return vertical.value
      ? { height: `${thumbLength.value}px`, transform: `translateY(${shift})` }
      : { width: `${thumbLength.value}px`, transform: `translateX(${shift})` };
  });

  watchEffect(() => (overflowing.value = overflow.value > 1));

  function onPointerDown(event: PointerEvent) {
    const startPointer = vertical.value ? event.clientY : event.clientX;
    const startScroll = scrolled.value;

    const stopMove = useEventListener(
      window,
      'pointermove',
      (move: PointerEvent) => {
        if (!travel.value) return;

        const pointer = vertical.value ? move.clientY : move.clientX;
        const shift = (pointer - startPointer) / travel.value;
        scrolled.value = startScroll + shift * overflow.value;
      }
    );

    const stopUp = useEventListener(window, 'pointerup', () => {
      stopMove();
      stopUp();
    });
  }
</script>

<template>
  <div
    ref="rail"
    class="b-scrollbar"
    :class="[
      `b-scrollbar--${axis}`,
      { 'b-scrollbar--overflowing': overflowing },
    ]"
    v-bind="$attrs"
  >
    <span
      class="b-scrollbar__thumb"
      :style="thumbStyle"
      @pointerdown.prevent="onPointerDown"
    />
  </div>
</template>

<style>
  :where(.b-scrollbar) {
    --scrollbar-rail: 5px;
    --scrollbar-thumb: 14px;
    --scrollbar-stroke: var(--b-stroke, 1.4px);
    /* the fill sits inside the contour, so its tips are shorter by the stroke */
    --scrollbar-core: calc(var(--scrollbar-thumb) - var(--scrollbar-stroke) * 2);

    position: relative;
    flex: none;
    /* the thumb is sized in pixels, so a shrinking rail has to cut it off */
    overflow: hidden;
    touch-action: none;
    /*
     * Faded rather than dropped, so whatever holds it can hold it on screen
     * with nothing to scroll, or take it off screen with plenty. Keeping it
     * rendered also keeps the rail measurable — dropped, it reports no length
     * and the thumb comes back the wrong size.
     */
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.18s ease,
      visibility 0.18s;
  }

  .b-scrollbar--overflowing {
    opacity: 1;
    visibility: visible;
  }

  .b-scrollbar--vertical {
    width: var(--scrollbar-thumb);
  }

  .b-scrollbar--horizontal {
    height: var(--scrollbar-thumb);
  }

  .b-scrollbar::before {
    content: '';
    position: absolute;
    background: var(--b-line);
  }

  /*
   * The shape laid along the rail: tips are half its thickness, which is the
   * same 45deg the frame is built on. Written out per element and per axis,
   * since a clip-path holding var() cannot be shared through a custom property.
   */
  .b-scrollbar--vertical::before {
    top: 0;
    bottom: 0;
    left: 50%;
    width: var(--scrollbar-rail);
    margin-left: calc(var(--scrollbar-rail) / -2);
    clip-path: polygon(
      50% 0,
      100% calc(var(--scrollbar-rail) / 2),
      100% calc(100% - var(--scrollbar-rail) / 2),
      50% 100%,
      0 calc(100% - var(--scrollbar-rail) / 2),
      0 calc(var(--scrollbar-rail) / 2)
    );
  }

  .b-scrollbar--horizontal::before {
    top: 50%;
    right: 0;
    left: 0;
    height: var(--scrollbar-rail);
    margin-top: calc(var(--scrollbar-rail) / -2);
    clip-path: polygon(
      0 50%,
      calc(var(--scrollbar-rail) / 2) 0,
      calc(100% - var(--scrollbar-rail) / 2) 0,
      100% 50%,
      calc(100% - var(--scrollbar-rail) / 2) 100%,
      calc(var(--scrollbar-rail) / 2) 100%
    );
  }

  /*
   * The thumb is a plain button in miniature: contour, then fill inside it.
   * The fill is flat, though — the plate gradient carries a diagonal light,
   * and across something this narrow it reads as a bright patch.
   */
  .b-scrollbar__thumb {
    position: absolute;
    top: 0;
    left: 0;
    background: var(--b-line-strong);
    cursor: grab;
  }

  .b-scrollbar--vertical .b-scrollbar__thumb {
    width: var(--scrollbar-thumb);
    clip-path: polygon(
      50% 0,
      100% calc(var(--scrollbar-thumb) / 2),
      100% calc(100% - var(--scrollbar-thumb) / 2),
      50% 100%,
      0 calc(100% - var(--scrollbar-thumb) / 2),
      0 calc(var(--scrollbar-thumb) / 2)
    );
  }

  .b-scrollbar--horizontal .b-scrollbar__thumb {
    height: var(--scrollbar-thumb);
    clip-path: polygon(
      0 50%,
      calc(var(--scrollbar-thumb) / 2) 0,
      calc(100% - var(--scrollbar-thumb) / 2) 0,
      100% 50%,
      calc(100% - var(--scrollbar-thumb) / 2) 100%,
      calc(var(--scrollbar-thumb) / 2) 100%
    );
  }

  .b-scrollbar__thumb::after {
    content: '';
    position: absolute;
    inset: var(--scrollbar-stroke);
    background: var(--b-elevated);
    transition: background 0.15s ease;
  }

  .b-scrollbar--vertical .b-scrollbar__thumb::after {
    clip-path: polygon(
      50% 0,
      100% calc(var(--scrollbar-core) / 2),
      100% calc(100% - var(--scrollbar-core) / 2),
      50% 100%,
      0 calc(100% - var(--scrollbar-core) / 2),
      0 calc(var(--scrollbar-core) / 2)
    );
  }

  .b-scrollbar--horizontal .b-scrollbar__thumb::after {
    clip-path: polygon(
      0 50%,
      calc(var(--scrollbar-core) / 2) 0,
      calc(100% - var(--scrollbar-core) / 2) 0,
      100% 50%,
      calc(100% - var(--scrollbar-core) / 2) 100%,
      calc(var(--scrollbar-core) / 2) 100%
    );
  }

  .b-scrollbar__thumb:hover::after {
    background: var(--b-raised);
  }

  .b-scrollbar__thumb:active {
    cursor: grabbing;
  }
</style>
