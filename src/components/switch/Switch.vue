<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import BThumb from '../thumb/Thumb.vue';
  import { cn } from '../../utils/cn';
  import { switchVariants, type ISwitchProps } from '.';

  defineOptions({ name: 'BSwitch', inheritAttrs: false });

  /**
   * A native button carries the whole behaviour: Space and Enter, focus and the
   * announced state come for free, so only the visuals are ours.
   */
  const props = withDefaults(defineProps<ISwitchProps>(), {
    size: 'md',
  });

  const model = defineModel<boolean>({ default: false });

  /*
   * Sizes are classes; only a colour handed in from outside is written here.
   * The handle is told separately and only when asked: left alone it wears the
   * spectrum, and a variable set to the tone would paint over it.
   */
  const cssVariables = computed<CSSProperties>(() =>
    props.accent
      ? ({
          '--switch-accent': props.accent,
          '--thumb-color': props.accent,
        } as CSSProperties)
      : {}
  );

  function toggle() {
    if (!props.disabled) model.value = !model.value;
  }
</script>

<template>
  <button
    type="button"
    role="switch"
    :class="
      cn(
        switchVariants({ disabled }),
        `b-switch--${size}`,
        model && 'b-switch--on',
        $attrs.class as string
      )
    "
    :style="cssVariables"
    :aria-checked="model"
    :disabled
    @click="toggle"
  >
    <span class="b-switch__track">
      <BFrame
        glass
        :band="false"
        :glow="false"
      />

      <span class="b-switch__fills b-clip">
        <span class="b-switch__fill" />
      </span>

      <BThumb
        class="b-switch__thumb"
        :disabled
      />
    </span>

    <span v-if="label">{{ label }}</span>
  </button>
</template>

<style>
  .b-switch--xs {
    --switch-height: 12px;
    --thumb-size: 20px;
  }

  .b-switch--sm {
    --switch-height: 16px;
    --thumb-size: 26px;
  }

  .b-switch--md {
    --switch-height: 20px;
    --thumb-size: 32px;
  }

  .b-switch--lg {
    --switch-height: 26px;
    --thumb-size: 42px;
  }

  .b-switch--xl {
    --switch-height: 32px;
    --thumb-size: 52px;
  }

  :where(.b-switch) {
    --switch-accent: var(--b-tone, var(--b-text));
    --frame-line: var(--b-line);

    --frame-slant: calc(var(--switch-height) / 2);
    /* the track stays about three times its height, the handle overhangs it */
    --switch-width: calc(var(--switch-height) * 2.8);

    font-size: inherit;
  }

  .b-switch:hover {
    --frame-line: var(--b-line-strong);
  }

  .b-switch--on {
    --frame-line: var(--switch-accent);
  }

  /*
   * Filled the way the slider's track is: a layer of its own inside the
   * contour, not `--frame-fill`. The frame's fill sits under the line layer
   * and reads as the plate a control is cut from, so tinting it only ever
   * gives a wash of the accent — what is wanted here is the accent itself, at
   * full strength, which is what the slider shows.
   *
   * Two elements, and it has to be two. The clip is a polygon in per cent, so
   * it is measured against the box that carries it — put on the growing part
   * it would be recomputed at every width, and at nothing wide the bevels
   * invert and the shape turns inside out. The outer box therefore never
   * moves and holds the contour; the inner one moves inside it and is cut by
   * it.
   */
  .b-switch__fills {
    --frame-layer: var(--b-stroke);

    position: absolute;
    inset: 0;
  }

  /*
   * Grown by its own right edge rather than by a transform: a scaleX would
   * squeeze the bevels along with everything else and slide the narrowed form
   * out from under the left tip, the clip above staying where it was.
   */
  .b-switch__fill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 100%;
    background: var(--switch-accent);
    transition: right 0.2s cubic-bezier(0.2, 0.7, 0.3, 1);
  }

  .b-switch--on .b-switch__fill {
    right: 0;
  }

  .b-switch__track {
    position: relative;
    flex: none;
    width: var(--switch-width);
    height: var(--switch-height);
  }

  /* the handle slides between the tips, so neither end is cut off */
  .b-switch__thumb {
    position: absolute;
    top: 50%;
    left: calc(var(--thumb-size) / 2);
    transform: translate(-50%, -50%);
    transition: left 0.2s cubic-bezier(0.2, 0.7, 0.3, 1);
  }

  .b-switch--on .b-switch__thumb {
    left: calc(var(--switch-width) - var(--thumb-size) / 2);
  }

  .b-switch:focus-visible {
    outline: none;
  }

  .b-switch:focus-visible > .b-switch__track > .b-frame {
    --frame-focus: var(--switch-accent);
    --frame-focus-opacity: 0.9;
    --frame-focus-animation: b-frame-focus-in 0.34s
      cubic-bezier(0.2, 0.8, 0.3, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    .b-switch__thumb,
    .b-switch__fill {
      transition: none;
    }
  }
</style>
