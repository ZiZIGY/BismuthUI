<script setup lang="ts">
  import { computed, ref, useTemplateRef, type CSSProperties } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import BThumb from '../thumb/Thumb.vue';
  import { cn } from '../../utils/cn';
  import { sliderVariants, type ISliderProps } from '.';

  defineOptions({ name: 'BSlider', inheritAttrs: false });

  /**
   * The handle is driven by pointer and keyboard directly instead of a hidden
   * `input[type=range]`: a native control cannot carry the halo and the press
   * wave, and the hit area has to stay bigger than the visible rhombus.
   *
   * Pass an array as the model to get a range — one handle per value.
   */
  const props = withDefaults(defineProps<ISliderProps>(), {
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
  });

  const model = defineModel<number | number[]>({ default: 0 });
  const track = useTemplateRef<HTMLElement>('track');
  const thumbs = useTemplateRef<{ $el: HTMLElement }[]>('thumbs');
  const activeIndex = ref(0);

  const values = computed(() =>
    Array.isArray(model.value) ? model.value : [model.value]
  );

  const toRatio = (value: number) => {
    const span = props.max - props.min;
    if (span <= 0) return 0;
    return Math.min(Math.max((value - props.min) / span, 0), 1);
  };

  const ratios = computed(() => values.value.map(toRatio));

  /*
   * Where the marks go, as ratios. `true` is every step, a number is every Nth
   * step, and a list is taken as the values themselves — the last of those is
   * the one that matters on a long scale, where a mark per step is a smear and
   * what is wanted is the handful of figures worth reading.
   *
   * Anything landing outside the range is dropped rather than clamped: a mark
   * pinned to an end it does not belong to reads as a value that exists.
   */
  const ticks = computed(() => {
    const setting = props.ticks;
    if (!setting) return [];

    if (Array.isArray(setting)) {
      return setting
        .filter((value) => value >= props.min && value <= props.max)
        .map(toRatio);
    }

    const stride = props.step * (typeof setting === 'number' ? setting : 1);
    if (stride <= 0) return [];

    const marks: number[] = [];
    for (let value = props.min; value <= props.max; value += stride) {
      marks.push(toRatio(value));
    }
    return marks;
  });

  /** A single handle fills from the start, a range fills between the handles. */
  const fillStyle = computed<CSSProperties>(() => {
    const list = ratios.value;
    const from = list.length > 1 ? Math.min(...list) : 0;
    const to = list.length > 1 ? Math.max(...list) : list[0];

    // same travel range as the handle, so the two always meet
    const edge = (ratio: number) =>
      `calc(var(--slider-thumb) / 2 + ${ratio} * var(--slider-travel))`;

    return {
      left: list.length > 1 ? edge(from) : '0px',
      right: `calc(100% - ${edge(to)})`,
    };
  });

  /*
   * Sizes are classes; only a colour handed in from outside is written here.
   * The handle is told separately and only when asked: left alone it wears the
   * spectrum, and a variable set to the tone would paint over it.
   */
  const cssVariables = computed<CSSProperties>(() =>
    props.accent
      ? ({
          '--slider-accent': props.accent,
          '--thumb-color': props.accent,
        } as CSSProperties)
      : {}
  );

  /** Rounds to the step grid, keeps the value in range and handles in order. */
  function commit(index: number, value: number) {
    const stepped = Math.round((value - props.min) / props.step) * props.step;
    const list = values.value;

    // neighbours act as bounds, so handles never cross each other
    const lower = index > 0 ? list[index - 1] : props.min;
    const upper = index < list.length - 1 ? list[index + 1] : props.max;
    const clamped = Math.min(Math.max(props.min + stepped, lower), upper);

    // step can be fractional, so trim the float tail it leaves behind
    const next = Number(clamped.toFixed(6));

    if (!Array.isArray(model.value)) {
      model.value = next;
      return;
    }

    const updated = [...model.value];
    updated[index] = next;
    model.value = updated;
  }

  /*
   * The handle travels between the tips, not across the whole track, so the
   * pointer has to be read in that same range — otherwise the two drift apart,
   * and the further from the centre the wider the gap. Its width is a size
   * class, so the figure is read back out of CSS.
   */
  function valueFromPointer(clientX: number) {
    const element = track.value;
    const rect = element?.getBoundingClientRect();
    if (!element || !rect?.width) return null;

    const thumb = Number.parseFloat(
      getComputedStyle(element).getPropertyValue('--slider-thumb')
    );
    const travel = rect.width - thumb;
    if (travel <= 0) return props.min;

    const ratio = (clientX - rect.left - thumb / 2) / travel;
    return props.min + ratio * (props.max - props.min);
  }

  /** Grabs whichever handle is closest to the pointer. */
  function nearestIndex(value: number) {
    return values.value.reduce(
      (closest, current, index) =>
        Math.abs(current - value) < Math.abs(values.value[closest] - value)
          ? index
          : closest,
      0
    );
  }

  function onPointerDown(event: PointerEvent) {
    if (props.disabled || event.button !== 0) return;

    const value = valueFromPointer(event.clientX);
    if (value === null) return;

    activeIndex.value = nearestIndex(value);
    thumbs.value?.[activeIndex.value]?.$el?.focus();
    commit(activeIndex.value, value);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent) {
    if (event.buttons !== 1) return;

    const value = valueFromPointer(event.clientX);
    if (value !== null) commit(activeIndex.value, value);
  }

  const KEY_DIRECTIONS: Record<string, number> = {
    ArrowRight: 1,
    ArrowUp: 1,
    ArrowLeft: -1,
    ArrowDown: -1,
  };

  function onKeyDown(event: KeyboardEvent, index: number) {
    if (props.disabled) return;

    const current = values.value[index];
    const direction = KEY_DIRECTIONS[event.key];

    if (direction) {
      commit(index, current + direction * props.step);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const page = props.step * 10;
      commit(index, current + (event.key === 'PageUp' ? page : -page));
    } else if (event.key === 'Home') {
      commit(index, props.min);
    } else if (event.key === 'End') {
      commit(index, props.max);
    } else {
      return;
    }

    event.preventDefault();
  }
</script>

<template>
  <div
    :class="
      cn(
        sliderVariants({ disabled }),
        `b-slider--${size}`,
        thumbLabel && 'b-slider--labelled',
        $attrs.class as string
      )
    "
    :style="cssVariables"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
  >
    <div
      ref="track"
      class="b-slider__track"
    >
      <BFrame
        glass
        :band="false"
        :glow="false"
      />

      <div class="b-slider__fills b-clip">
        <div
          class="b-slider__fill"
          :style="fillStyle"
        />
      </div>

      <span
        v-for="(ratio, index) in ticks"
        :key="index"
        class="b-slider__tick"
        :style="{ '--tick-ratio': ratio }"
      />
    </div>

    <BThumb
      v-for="(value, index) in values"
      :key="index"
      ref="thumbs"
      class="b-slider__thumb"
      :disabled
      :style="{ '--slider-ratio': ratios[index] }"
      role="slider"
      :tabindex="disabled ? -1 : 0"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="value"
      :aria-disabled="disabled || undefined"
      aria-orientation="horizontal"
      @keydown="onKeyDown($event, index)"
      @pointerdown="activeIndex = index"
    >
      <span
        v-if="thumbLabel"
        class="b-slider__bubble"
        :class="{
          'b-slider__bubble--pinned': thumbLabel === 'always',
          'b-slider__bubble--lone': thumbLabel === 'active',
        }"
      >
        <BFrame
          :band="false"
          :glow="false"
        />

        <span class="b-slider__bubble-text">
          <slot
            name="thumb-label"
            :value
            :index
          >
            {{ value }}
          </slot>
        </span>
      </span>
    </BThumb>
  </div>
</template>

<style>
  .b-slider--xs {
    --tick-size: 3px;
    --bubble-height: 20px;
    --bubble-tail: 5px;
    --slider-height: 10px;
    --slider-thumb: 16px;
  }

  .b-slider--sm {
    --tick-size: 4px;
    --bubble-height: 24px;
    --bubble-tail: 6px;
    --slider-height: 14px;
    --slider-thumb: 20px;
  }

  .b-slider--md {
    --tick-size: 5px;
    --bubble-height: 28px;
    --bubble-tail: 7px;
    --slider-height: 18px;
    --slider-thumb: 26px;
  }

  .b-slider--lg {
    --tick-size: 6px;
    --bubble-height: 34px;
    --bubble-tail: 8px;
    --slider-height: 24px;
    --slider-thumb: 34px;
  }

  .b-slider--xl {
    --tick-size: 7px;
    --bubble-height: 40px;
    --bubble-tail: 9px;
    --slider-height: 30px;
    --slider-thumb: 42px;
  }

  :where(.b-slider) {
    /*
     * `--b-tone` is the whole of the colour API: set it on the element, on an
     * ancestor or in a stylesheet, and it inherits down.
     *
     * Left alone it is the groove's own fill rather than the page's ink. Ink
     * is the colour of writing — near black on a pale page, near white on a
     * dark one — and a bar painted in it against a groove painted in the
     * surface gives two extremes with nothing between them: neither reads as
     * a track with something in it. The pair is set as one in the theme, held
     * apart far enough to tell but short of either end.
     */
    --slider-accent: var(--b-tone, var(--b-text));
    --frame-line: var(--b-line);
    /*
     * Handle and fill share one travel range: the centre of the handle is the
     * end of the fill, and neither leaves the track at the extremes.
     */
    --slider-travel: calc(100% - var(--slider-thumb));
    /*
     * Clear of the handle's tip, and clear enough that the tail reads as a
     * pointer rather than as a joint: sat close, the bubble looks stuck to the
     * stone instead of hanging over it.
     */
    --bubble-gap: 12px;

    --frame-slant: calc(var(--slider-height) / 2);

    /* the hit area is larger than the rhombus, never smaller than a finger */
    min-height: max(44px, var(--slider-thumb));
    cursor: pointer;
  }

  /*
   * Room for the bubble is held from the start, whether one is showing or not.
   * It is an overlay and takes no space of its own, so without this the slider
   * is one height at rest and another the moment a handle is touched — and in
   * a column of them, everything below jumps. Reserved, nothing moves.
   *
   * Margin rather than padding: the handle is placed against the host box and
   * the track is centred inside it, so padding moves the two apart — the
   * track drops by the room reserved and the handle stays on the middle of a
   * box that is now taller. A margin holds the space outside the box instead,
   * where nothing is measured against it. Only sliders that can show a bubble
   * pay for it.
   */
  .b-slider--labelled {
    margin-top: calc(
      var(--bubble-height) + var(--bubble-gap) + var(--bubble-tail)
    );
  }

  .b-slider:hover {
    --frame-line: var(--b-line-strong);
  }

  .b-slider__track {
    position: relative;
    width: 100%;
    height: var(--slider-height);
  }

  /* the fill lives inside the track contour, so it cannot spill over the frame */
  .b-slider__fills {
    --frame-layer: var(--b-stroke);

    position: absolute;
    inset: 0;
  }

  /* flat ends: the bevel is already drawn by the track itself */
  .b-slider__fill {
    position: absolute;
    top: 0;
    bottom: 0;
    background: var(--slider-accent);
  }

  /*
   * Step marks, the loader's rhombus at rest: a square turned 45deg, which is
   * the same figure the handle and the focus brackets are cut from.
   *
   * They sit over the fill rather than under it, and keep one colour on both
   * sides of the handle. A mark is the scale, not the value — dimming the ones
   * already passed would say something about the value that is not true.
   */
  .b-slider__tick {
    position: absolute;
    top: 50%;
    /*
     * Written out rather than held in a variable: --tick-ratio lives on the
     * mark, and a formula in a custom property resolves where it is declared.
     * Same travel as the handle, so a mark and a handle on one value meet.
     */
    left: calc(
      var(--slider-thumb) / 2 + var(--tick-ratio) * var(--slider-travel)
    );
    width: var(--tick-size);
    height: var(--tick-size);
    background: var(--b-muted);
    opacity: 0.55;
    transform: translate(-50%, -50%) rotate(45deg);
    pointer-events: none;
  }

  /* --- bubble ------------------------------------------------------------- */

  /*
   * The readout over the handle, wearing the button's own shape: a frame with
   * the bevel set to half its height, which is the one rule the whole library
   * is cut by. Nothing here measures anything — the height is a size class and
   * the bevel follows from it.
   *
   * It hangs off the handle rather than off the track, so it travels with the
   * value for free and needs no second position to keep in step.
   */
  .b-slider__bubble {
    --frame-slant: calc(var(--bubble-height) / 2);
    --frame-line: var(--b-line);
    --frame-fill: var(--b-elevated);

    position: absolute;
    /*
     * Measured from the middle of the handle, not from the top of it: the box
     * is the 44px finger target, which is larger than the rhombus at most
     * sizes, so anything anchored to its edge floats away from the stone.
     */
    bottom: calc(50% + var(--slider-thumb) / 2 + var(--bubble-gap));
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: calc(var(--bubble-height) * 2.2);
    height: var(--bubble-height);
    padding-inline: calc(var(--bubble-height) * 0.75);
    opacity: 0;
    transform: translate(-50%, 4px) scale(0.94);
    transform-origin: bottom center;
    transition:
      opacity 0.16s ease,
      transform 0.16s cubic-bezier(0.2, 0.8, 0.3, 1);
    pointer-events: none;
  }

  /*
   * The tail, and the reason it is a rotated square rather than a border
   * triangle: the bubble carries a contour, so the tail needs one too, and
   * only on the two sides that face out. A square turned 45deg with two
   * borders gives exactly that, and it is the same figure the focus brackets
   * are built from.
   */
  .b-slider__bubble::after {
    content: '';
    position: absolute;
    /*
     * Drawn over the frame, not under it, and pulled up so its own fill covers
     * the contour it meets. The frame's line layer is a solid silhouette with
     * the fill inset over it, so the underside is a line the tail has to break
     * rather than sit against — under the frame it was crossed out by it.
     *
     * The overlap is a stroke less a pixel: a whole one buries the line but
     * carries the tail far enough in that its own shoulders show inside the
     * bubble. The two borders facing out carry the contour on around it, so
     * the outline still reads as one shape.
     */
    top: calc(100% - var(--b-stroke) + 1px);
    left: 50%;
    width: var(--bubble-tail);
    height: var(--bubble-tail);
    background: var(--b-elevated);
    border-right: var(--b-stroke) solid var(--b-line);
    border-bottom: var(--b-stroke) solid var(--b-line);
    transform: translate(-50%, -50%) rotate(45deg);
  }

  /*
   * Over the frame, which is positioned and would otherwise cover it: the
   * layers of a frame are painted by markup order, and this is not one of
   * them.
   */
  .b-slider__bubble-text {
    position: relative;
    font-size: calc(var(--bubble-height) * 0.5);
    line-height: 1;
    white-space: nowrap;
    color: var(--b-text);
  }

  /*
   * Shown while the handle is held or has the keyboard, which is when the
   * value is being chosen. `:has` covers the drag: the pointer capture keeps
   * `:active` on the handle for as long as the finger is down, wherever it
   * wanders.
   */
  /*
   * `pointer-events` comes back with the bubble and not before: one that took
   * the pointer while invisible would swallow presses aimed at the track above
   * the handle.
   */
  .b-slider__thumb:active .b-slider__bubble,
  .b-slider__thumb:focus-visible .b-slider__bubble,
  .b-slider__bubble--pinned {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
    pointer-events: auto;
  }

  /*
   * `active`: only the handle being used says anything. A range whose two
   * readouts sit a few pixels apart is less legible than one, and the value
   * not being changed is the one nobody is reading.
   */
  .b-slider__bubble--lone {
    opacity: 0;
    pointer-events: none;
  }

  .b-slider__thumb:active .b-slider__bubble--lone,
  .b-slider__thumb:focus-visible .b-slider__bubble--lone {
    opacity: 1;
    pointer-events: auto;
  }

  /* --- thumb -------------------------------------------------------------- */

  :where(.b-slider) {
    --thumb-size: var(--slider-thumb);
  }

  /*
   * The handle centre sits exactly where the fill ends: any inset here would
   * shift it away from the edge and open a gap between the two.
   */
  /*
   * The handle in use rides over the rest, so a bubble or a stone is never
   * buried by a neighbour standing on the same value. Both states are the
   * browser's own, which is why this needs nothing from the script: pointer
   * capture holds `:active` for the length of a drag, and the keyboard leaves
   * `:focus-visible` on whichever handle it moved to.
   */
  .b-slider__thumb:active,
  .b-slider__thumb:focus-visible {
    z-index: 1;
  }

  .b-slider__thumb {
    position: absolute;
    top: 50%;
    /*
     * Written out here on purpose: --slider-ratio lives on the handle, and a
     * variable holding this formula would resolve where it was declared.
     */
    left: calc(
      var(--slider-thumb) / 2 + var(--slider-ratio) * var(--slider-travel)
    );
    transform: translate(-50%, -50%);
  }

</style>
