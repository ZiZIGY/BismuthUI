<script setup lang="ts">
  import type { TFieldAlign } from '.';

  defineOptions({ name: 'BFieldAddon', inheritAttrs: false });

  /**
   * A cell inside the field frame: an icon, a caption, a button, a whole row of
   * them. Four places to sit — beside the control, or on a row of its own above
   * or below it — so a field can be composed instead of configured.
   */
  withDefaults(defineProps<{ align?: TFieldAlign }>(), {
    align: 'inline-start',
  });
</script>

<template>
  <span
    class="b-field__addon"
    :class="`b-field__addon--${align}`"
    v-bind="$attrs"
  >
    <slot />
  </span>
</template>
