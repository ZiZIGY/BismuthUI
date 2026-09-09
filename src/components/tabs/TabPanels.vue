<script setup lang="ts">
  defineOptions({ name: 'BTabPanels' });

  /**
   * The box the panels share. It clips, which is what lets a panel wait a full
   * width away instead of a token distance, and it is the positioned ancestor
   * the waiting ones are measured against.
   *
   * The price is paid by anything that opens out of a panel — a select's list,
   * a tooltip — since a box that clips a sliding panel clips those too. A page
   * that needs one can turn the clipping off with `--tabs-overflow: visible`
   * and lose the slide, which is the honest half of the trade.
   */
</script>

<template>
  <div class="b-tab-panels">
    <slot />
  </div>
</template>

<style>
  .b-tab-panels {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    overflow: var(--tabs-overflow, hidden);
  }
</style>
