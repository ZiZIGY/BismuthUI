<script setup lang="ts">
  import { computed, useAttrs } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import BLoader from '../loader/Loader.vue';
  import { vRipple } from '../../directives/ripple';
  import { cn } from '../../utils/cn';
  import { buttonVariants, type IButtonProps } from '.';

  defineOptions({ name: 'BButton', inheritAttrs: false });

  const props = withDefaults(defineProps<IButtonProps>(), {
    variant: 'spectrum',
    size: 'md',
    caps: true,
    speed: 'normal',
    ripple: true,
    type: 'button',
  });

  const attrs = useAttrs();

  const isDisabled = computed(() => props.disabled || props.loading);

  const hasRing = computed(() => props.variant === 'spectrum');

  const frameProps = computed(() => ({
    rhombus: props.square,
    blunt: props.blunt,
    band: hasRing.value,
    glass: props.variant === 'outline',
    glow: (props.glow ?? hasRing.value) && !isDisabled.value,
    colors: props.colors,
    speed: isDisabled.value ? 'none' : props.speed,
  }));

  const tag = computed(() => props.as ?? (props.href ? 'a' : 'button'));

  const hostAttributes = computed(() => {
    const { class: _ignoredClass, ...rest } = attrs;

    if (tag.value === 'a') {
      return {
        ...rest,
        href: isDisabled.value ? undefined : props.href,
        target: props.target,
        rel:
          props.rel ??
          (props.target === '_blank' ? 'noreferrer noopener' : undefined),
        role: 'button',
        tabindex: isDisabled.value ? -1 : 0,
        'aria-disabled': isDisabled.value || undefined,
        'aria-busy': props.loading || undefined,
      };
    }
    return {
      ...rest,
      type: tag.value === 'button' ? props.type : undefined,
      disabled:
        tag.value === 'button' ? isDisabled.value || undefined : undefined,
      'aria-busy': props.loading || undefined,
    };
  });

  function onClick(event: MouseEvent) {
    if (!isDisabled.value) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
</script>

<template>
  <component
    :is="tag"
    :class="
      cn(
        `b-button--${size}`,
        buttonVariants({
          variant,
          block,
          square,
          caps,
          disabled: isDisabled,
        }),
        attrs.class as string
      )
    "
    v-ripple="isDisabled ? false : ripple"
    @click="onClick"
    v-bind="hostAttributes"
  >
    <BFrame v-bind="frameProps" />

    <span
      class="b-button__label relative z-1 inline-flex items-center justify-center gap-(--button-gap)"
      :class="{ invisible: loading }"
    >
      <slot />
    </span>

    <BLoader
      v-if="loading"
      class="absolute inset-0 z-2"
    />
  </component>
</template>

<style>
  /* tracking is unitless, so it scales with the font rather than fighting it */
  .b-button--xs {
    --button-height: 28px;
    --button-font-size: 11px;
    --button-gap: 6px;
    --button-pad: 10px;
    --button-track: 0.18;
  }

  .b-button--sm {
    --button-height: 34px;
    --button-font-size: 12px;
    --button-gap: 7px;
    --button-pad: 13px;
    --button-track: 0.2;
  }

  .b-button--md {
    --button-height: 44px;
    --button-font-size: 13px;
    --button-gap: 8px;
    --button-pad: 16px;
    --button-track: 0.22;
  }

  .b-button--lg {
    --button-height: 54px;
    --button-font-size: 15px;
    --button-gap: 10px;
    --button-pad: 20px;
    --button-track: 0.24;
  }

  .b-button--xl {
    --button-height: 64px;
    --button-font-size: 17px;
    --button-gap: 12px;
    --button-pad: 26px;
    --button-track: 0.26;
  }

  :where(.b-button) {
    --button-surface: var(--b-surface, var(--color-ink-950));

    --frame-slant: calc(var(--button-height) / 2);

    /* text clears the bevel, and uppercase gives back its trailing space */
    --button-pad-inline: calc(var(--button-height) / 2 + var(--button-pad));
    --button-trailing: 0px;

    height: var(--button-height);
    padding-inline: var(--button-pad-inline)
      calc(var(--button-pad-inline) - var(--button-trailing));
    font-size: var(--button-font-size);
  }

  .b-button:focus-visible {
    outline: none;
  }

  /*
   * Tracking, and the reason the size grid carries it: the trailing space it
   * adds after the last letter is taken back out of the end padding, or an
   * uppercase label would sit off centre.
   */
  .b-button--caps {
    --button-trailing: calc(var(--button-font-size) * var(--button-track));

    letter-spacing: calc(var(--button-track) * 1em);
  }

  /*
   * Tailwind utilities live in @layer while component rules do not, and
   * unlayered rules win regardless of specificity. Hence the rhombus size sits
   * here: otherwise the base height would beat a w-/h- utility.
   */
  .b-button--square {
    --button-pad-inline: 0px;

    width: var(--button-height);
  }

  /*
   * The press wave repeats the fill contour: same inset, same clip. The clip is
   * what contains it too, now that the layer brings no `overflow` of its own —
   * which is the point, since a rectangle would have cut the bevels off first.
   */
  .b-button .b-ripple {
    --frame-layer: calc(var(--b-stroke) * 1.8 + var(--frame-band, 0px));

    clip-path: polygon(
      calc(var(--frame-layer) * 1.4142) 50%,
      calc(var(--frame-slant) + var(--frame-layer) * 0.4142) var(--frame-layer),
      calc(100% - var(--frame-slant) - var(--frame-layer) * 0.4142)
        var(--frame-layer),
      calc(100% - var(--frame-layer) * 1.4142) 50%,
      calc(100% - var(--frame-slant) - var(--frame-layer) * 0.4142)
        calc(100% - var(--frame-layer)),
      calc(var(--frame-slant) + var(--frame-layer) * 0.4142)
        calc(100% - var(--frame-layer))
    );
  }

  .b-button--square .b-ripple {
    clip-path: polygon(
      calc(var(--frame-layer) * 1.4142) 50%,
      50% calc(var(--frame-layer) * 1.4142),
      calc(100% - var(--frame-layer) * 1.4142) 50%,
      50% calc(100% - var(--frame-layer) * 1.4142)
    );
  }
</style>
