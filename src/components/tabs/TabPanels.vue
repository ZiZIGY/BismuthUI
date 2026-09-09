<script setup lang="ts">
  defineOptions({ name: 'BTabPanels' });

  /**
   * The box the panels share. One grid cell, every panel in it, which is what
   * settles both the size and the sliding.
   *
   * The size, because a stack of grid items in one cell makes the cell as
   * large as the largest of them and then hands that size to all of them. The
   * box is therefore as tall as its tallest panel and stays there — nothing
   * moves when the chosen one changes, so there is no height to animate and
   * no jump to hide. A page that wants a different height sets one; the cell
   * follows the box.
   *
   * The sliding, because every panel now measures the same. A panel parked at
   * `100%` travels its own height, so panels of different heights parked by
   * the same rule stop in different places — which is exactly what showed as
   * a neighbour lodged inside the box, and as a first move that slid one
   * distance and then snapped to another.
   *
   * It clips, which is what lets a panel wait a full width away instead of a
   * token distance. The price is paid by anything that opens out of a panel —
   * a select's list, a tooltip — since a box that clips a sliding panel clips
   * those too. `--tabs-overflow: visible` turns that off and loses the slide,
   * which is the honest half of the trade.
   */
</script>

<template>
  <div class="b-tab-panels">
    <slot />
  </div>
</template>

<style>
  .b-tab-panels {
    display: grid;
    flex: 1 1 auto;
    min-width: 0;
    overflow: var(--tabs-overflow, hidden);
  }
</style>
