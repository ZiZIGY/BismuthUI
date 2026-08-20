<script setup lang="ts">
  defineOptions({ name: 'BOptionGroup', inheritAttrs: false });

  /**
   * A run of rows under a heading. It holds nothing of its own beyond the
   * caption — the rows inside stay whatever the list makes of them, and the
   * arrow keys walk straight through, since they read rows and not structure.
   */
  defineProps<{ label?: string }>();
</script>

<template>
  <div
    class="b-option-group"
    role="group"
    :aria-label="label"
    v-bind="$attrs"
  >
    <span
      v-if="label"
      class="b-option-group__label"
      aria-hidden="true"
      >{{ label }}</span
    >

    <slot />
  </div>
</template>

<style>
  /*
   * A column, like the list itself: a button sizes to its text even as a block
   * box, and would shrink-wrap in anything that is not one.
   */
  .b-option-group {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .b-option-group + .b-option-group {
    margin-top: 0.4em;
  }

  /*
   * Set in from the same bevel the rows keep clear of, so the heading starts
   * on the column their text does rather than over their pointed ends.
   */
  .b-option-group__label {
    display: block;
    padding-block: 0.35em;
    padding-inline: calc(
      var(--option-slant, 1.25em) + var(--option-pad, 0.7em)
    );
    font-size: 0.75em;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--b-muted);
  }
</style>
