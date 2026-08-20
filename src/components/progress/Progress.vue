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
  </div>
</template>

<style>
  .b-progress--xs {
    --progress-height: 6px;
  }

  .b-progress--sm {
    --progress-height: 8px;
  }

  .b-progress--md {
    --progress-height: 12px;
  }

  .b-progress--lg {
    --progress-height: 18px;
  }

  .b-progress--xl {
    --progress-height: 24px;
  }

  :where(.b-progress) {
    --frame-line: var(--b-line);
    --progress-accent: var(--b-tone, var(--b-text));

    --frame-slant: calc(var(--progress-height) / 2);
    /*
     * Over the full height a side crosses two bevels, so the fill edge is cut
     * at the same angle and the bar reads as /----/.
     */
    --progress-skew: var(--progress-height);

    height: var(--progress-height);
  }

  /* the bar is clipped by the same contour as the track fill */
  .b-progress__track {
    --frame-layer: var(--b-stroke);

    position: absolute;
    inset: 0;
  }

  /*
   * The bar is wider than the track and starts past its left edge: at zero it
   * stays out of sight, at a hundred the slanted edge covers the tip entirely.
   * Only the right edge travels; the left one is always off screen.
   */
  .b-progress__value {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -100%;
    right: calc(
      (1 - var(--progress-ratio)) * 100% - var(--progress-ratio) *
        var(--progress-skew)
    );
    clip-path: polygon(
      var(--progress-skew) 0,
      100% 0,
      calc(100% - var(--progress-skew)) 100%,
      0 100%
    );
    background: var(--progress-accent);
    transition: right 0.3s ease;
  }

  .b-progress--reverse .b-progress__value {
    right: -100%;
    left: calc(
      (1 - var(--progress-ratio)) * 100% - var(--progress-ratio) *
        var(--progress-skew)
    );
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
