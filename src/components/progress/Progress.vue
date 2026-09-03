<script setup lang="ts">
  import { computed, useAttrs, type CSSProperties } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import { cn } from '../../utils/cn';
  import { progressVariants, type IProgressProps } from '.';

  defineOptions({ name: 'BProgress', inheritAttrs: false });

  const props = withDefaults(defineProps<IProgressProps>(), {
    size: 'md',
  });

  const attrs = useAttrs();

  const percent = computed(() =>
    props.value === undefined
      ? undefined
      : Math.min(Math.max(props.value, 0), 100)
  );

  /* the ratio is the only figure that changes with the value */
  const cssVariables = computed<CSSProperties>(
    () =>
      ({ '--progress-ratio': String((percent.value ?? 0) / 100) }) as CSSProperties
  );

  /*
   * Where the marks go, as ratios. `true` is every tenth, since a tenth is the
   * division a percentage already has; a number is that spacing in per cent;
   * a list is taken as the figures themselves, which is the one that matters
   * on a bar whose stages are not evenly spaced.
   *
   * Anything outside the range is dropped rather than clamped: a mark pinned
   * to an end it does not belong to reads as a stage that exists.
   */
  const ticks = computed(() => {
    const setting = props.ticks;
    if (!setting) return [];

    if (Array.isArray(setting)) {
      return setting
        .filter((mark) => mark >= 0 && mark <= 100)
        .map((mark) => mark / 100);
    }

    const stride = typeof setting === 'number' ? setting : 10;
    if (stride <= 0) return [];

    /*
     * The ends are left out. A generated run divides the bar, and the two
     * figures at the ends are the ones the bar already states with its own
     * points — a mark there is a second answer to a question nobody asked, and
     * it has to sit on the bevel, where there is no bar to sit on.
     *
     * A list is another matter: asked for a mark at nought, we draw one.
     */
    const marks: number[] = [];
    for (let mark = stride; mark < 100; mark += stride) marks.push(mark / 100);
    return marks;
  });
</script>

<template>
  <div
    :class="
      cn(
        `b-progress--${size}`,
        progressVariants({
          reverse,
          indeterminate: percent === undefined,
        }),
        attrs.class as string
      )
    "
    :style="cssVariables"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percent"
  >
    <BFrame
      glass
      :band="false"
      :glow="false"
    />

    <div class="b-progress__track b-clip">
      <div class="b-progress__value" />
    </div>

    <span
      v-for="(ratio, index) in ticks"
      :key="index"
      class="b-progress__tick"
      :style="{ '--tick-ratio': ratio }"
      aria-hidden="true"
    />
  </div>
</template>

<style>
  .b-progress--xs {
    --progress-height: 6px;
    --tick-size: 2px;
  }

  .b-progress--sm {
    --progress-height: 8px;
    --tick-size: 3px;
  }

  .b-progress--md {
    --progress-height: 12px;
    --tick-size: 4px;
  }

  .b-progress--lg {
    --progress-height: 18px;
    --tick-size: 6px;
  }

  .b-progress--xl {
    --progress-height: 24px;
    --tick-size: 7px;
  }

  :where(.b-progress) {
    --frame-line: var(--b-line);
    --progress-accent: var(--b-tone, var(--b-text));

    --frame-slant: calc(var(--progress-height) / 2);

    height: var(--progress-height);
  }

  /*
   * Step marks, the same rhombus the slider's are cut from, and travelling the
   * way the slider's do: over a range shortened at both ends, so the one at
   * nought and the one at a hundred stand in the bar rather than on its point.
   * The slider gives up half a handle at each end for the same reason.
   *
   * Here what is given up is the bevel. Inside it the bar is a triangle with
   * barely any height, and a mark placed there has nothing to sit on — set
   * flush against the slant it lies along the contour itself, which is what
   * made the end marks look like they had escaped.
   */
  .b-progress__tick {
    position: absolute;
    top: 50%;
    left: calc(
      var(--frame-slant) + var(--tick-ratio) * (100% - var(--frame-slant) * 2)
    );
    width: var(--tick-size);
    height: var(--tick-size);
    background: var(--b-muted);
    opacity: 0.55;
    transform: translate(-50%, -50%) rotate(45deg);
    pointer-events: none;
  }

  /* the bar is clipped by the same contour as the track fill */
  .b-progress__track {
    --frame-layer: var(--b-stroke);

    position: absolute;
    inset: 0;
  }

  /*
   * Pointed at both ends, the same hexagon the track is cut from — so the bar
   * reads as a smaller copy of the thing holding it rather than as a block
   * shoved into one end of it. The leading point is the value: it is the part
   * of the bar that moves, and it comes to a tip rather than a wall.
   *
   * Held to the middle with min()/max(). A bar narrower than two bevels would
   * otherwise send the two cuts past each other and turn the shape inside out;
   * clamped, it simply folds into a rhombus and keeps its point.
   */
  .b-progress__value {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: calc((1 - var(--progress-ratio)) * 100%);
    clip-path: polygon(
      0 50%,
      min(var(--frame-slant), 50%) 0,
      max(calc(100% - var(--frame-slant)), 50%) 0,
      100% 50%,
      max(calc(100% - var(--frame-slant)), 50%) 100%,
      min(var(--frame-slant), 50%) 100%
    );
    background: var(--progress-accent);
    transition: right 0.3s ease;
  }

  .b-progress--reverse .b-progress__value {
    right: 0;
    left: calc((1 - var(--progress-ratio)) * 100%);
    transition: left 0.3s ease;
  }

  /* indeterminate: a short segment travels from edge to edge */
  .b-progress--indeterminate .b-progress__value {
    left: 0;
    right: 65%;
    transition: none;
    animation: b-progress-slide 1.4s ease-in-out infinite;
  }

  .b-progress--reverse.b-progress--indeterminate .b-progress__value {
    animation-direction: reverse;
  }

  @keyframes b-progress-slide {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(285%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-progress__value {
      animation: none;
      transition: none;
    }
  }
</style>
