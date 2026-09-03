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

    const marks: number[] = [];
    for (let mark = 0; mark <= 100; mark += stride) marks.push(mark / 100);
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
   * Step marks, the same rhombus the slider's are cut from. Placed by the
   * ratio alone rather than inset from the tips: a mark stands for a figure,
   * the fill's leading edge stands for the same figure, and the two have to
   * meet — which costs the marks at nought and a hundred a bite out of the
   * bevel, and that is the right price.
   *
   * One colour on both sides of the fill. A mark is the scale, not the value.
   */
  .b-progress__tick {
    position: absolute;
    top: 50%;
    left: calc(var(--tick-ratio) * 100%);
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
   * Flat ends, and the bevels come from the contour the track is clipped by —
   * the same arrangement the slider fills its groove with. It used to cut its
   * own leading edge on the slant and sit wider than the track to hide the
   * other one, which drew a bar of a different shape from every other filled
   * thing here.
   */
  .b-progress__value {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: calc((1 - var(--progress-ratio)) * 100%);
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
