<script setup lang="ts">
  defineOptions({ name: 'BLoader' });

  /**
   * Pulsing rhombi. Size and colour are inherited from the text, so the loader
   * scales with whatever it sits in. Marked decorative: the busy state itself
   * is announced by `aria-busy` on the element that owns it.
   */
  withDefaults(defineProps<{ count?: number }>(), { count: 3 });
</script>

<template>
  <span
    class="b-loader inline-flex items-center justify-center gap-[0.42em]"
    aria-hidden="true"
  >
    <i
      v-for="index in count"
      :key="index"
      :style="{ animationDelay: `${(index - 1) * 0.14}s` }"
    />
  </span>
</template>

<style>
  .b-loader i {
    width: 0.4em;
    height: 0.4em;
    background: currentColor;
    animation: b-loader-pulse 1s ease-in-out infinite;
  }

  @keyframes b-loader-pulse {
    0%,
    100% {
      opacity: 0.25;
      transform: rotate(45deg) scale(0.75);
    }
    50% {
      opacity: 1;
      transform: rotate(45deg) scale(1.15);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-loader i {
      animation: none;
      opacity: 0.6;
      transform: rotate(45deg);
    }
  }
</style>
