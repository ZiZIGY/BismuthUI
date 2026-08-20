<script setup lang="ts">
  import BFrame from '../frame/Frame.vue';
  import { vRipple } from '../../directives/ripple';

  defineOptions({ name: 'BThumb', inheritAttrs: false });

  /**
   * The rhombus handle shared by the slider and the switch: a halo that repeats
   * its shape instead of the usual circle, and a press wave from the centre.
   *
   * The rhombus itself is the frame — the same one the spectrum button wears
   * and the same one marks a chosen row: contour, rainbow band, inner line,
   * fill. Stroke and band are taken from the size, or the smallest handle would
   * come out all ring and no stone.
   *
   * Size comes from `--thumb-size`, and `--thumb-color` fills the middle when
   * the component was handed one. The hit area never shrinks below a finger,
   * whatever the visible size is.
   */
  defineProps<{ disabled?: boolean }>();
</script>

<template>
  <span
    class="b-thumb"
    v-ripple="disabled ? false : { center: true }"
    v-bind="$attrs"
  >
    <span class="b-thumb__gem">
      <BFrame rhombus />
    </span>

    <slot />
  </span>
</template>

<style>
  /*
   * Size and colour are inherited from the component, so they must not be
   * declared here: an element's own value always beats an inherited one.
   * Defaults live in the var() fallbacks instead.
   */
  :where(.b-thumb) {
    /* halo and press wave share one diagonal, so they overlap exactly */
    --thumb-halo: calc(var(--thumb-size, 24px) * 1.5);

    position: relative;
    display: inline-block;
    width: max(44px, var(--thumb-size, 24px));
    height: max(44px, var(--thumb-size, 24px));
    outline: none;
  }

  /*
   * The stone. Its lines are a share of the size rather than a fixed number: a
   * stroke that reads as a hairline on the largest handle is most of the
   * smallest one.
   */
  .b-thumb__gem {
    --frame-stroke: calc(var(--thumb-size, 24px) * 0.055);
    --frame-band: calc(var(--thumb-size, 24px) * 0.075);
    --frame-line: var(--b-band-line);
    --frame-fill: var(--thumb-color, var(--b-elevated));

    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--thumb-size, 24px);
    height: var(--thumb-size, 24px);
    transform: translate(-50%, -50%);
    transition: transform 0.16s ease;
  }

  .b-thumb:active .b-thumb__gem {
    transform: translate(-50%, -50%) scale(0.92);
  }

  /* halo sits under everything and repeats the rhombus, not the usual circle */
  .b-thumb::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(var(--thumb-halo) / 1.4142);
    height: calc(var(--thumb-halo) / 1.4142);
    background: var(--thumb-color, var(--b-highlight));
    opacity: 0;
    transform: translate(-50%, -50%) rotate(45deg) scale(0.7);
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .b-thumb:hover::before,
  .b-thumb:focus-visible::before {
    opacity: 0.22;
    transform: translate(-50%, -50%) rotate(45deg) scale(1);
  }

  /*
   * The wave is clipped to the halo, not to the hit area: the layer spans the
   * whole 44px target, so a rhombus over its edges would be visibly larger
   * than the plate that appears on hover.
   */
  .b-thumb .b-ripple {
    --ripple-color: var(--thumb-color, var(--b-highlight));

    clip-path: polygon(
      50% calc(50% - var(--thumb-halo) / 2),
      calc(50% + var(--thumb-halo) / 2) 50%,
      50% calc(50% + var(--thumb-halo) / 2),
      calc(50% - var(--thumb-halo) / 2) 50%
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .b-thumb::before,
    .b-thumb__gem {
      transition: none;
    }
  }
</style>
