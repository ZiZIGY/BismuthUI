<script setup lang="ts">
  import { computed, useTemplateRef } from 'vue';
  import { useElementSize } from '@vueuse/core';
  import { motion } from 'motion-v';
  import { SPRING } from '../../theme/motion';

  defineOptions({ name: 'BTabPanels' });

  /**
   * The box the panels share, clipping them as they slide. Only the chosen
   * panel is mounted, so the box is as tall as that one — and the height is
   * sprung rather than left to jump. A taller panel opens the box as it slides
   * in; a shorter one lets it close once the panel it replaced is gone.
   *
   * The measurement is of the track inside, never of the box being animated —
   * reading the height of the thing you are also setting the height on is a
   * loop. Nothing measured, nothing animated: the box keeps its own `auto`.
   *
   * It clips, which is what lets a panel wait a full width away instead of a
   * token distance. The price is paid by anything that opens out of a panel —
   * a select's list, a tooltip — since a box that clips a sliding panel clips
   * those too. `--tabs-overflow: visible` turns that off and loses the slide,
   * which is the honest half of the trade.
   */
  const track = useTemplateRef<HTMLElement>('track');

  const { height } = useElementSize(track);

  const grown = computed(() =>
    height.value ? { height: height.value } : undefined
  );
</script>

<template>
  <motion.div
    :animate="grown"
    :transition="SPRING"
    class="b-tab-panels"
  >
    <div
      ref="track"
      class="b-tab-panels__track"
    >
      <slot />
    </div>
  </motion.div>
</template>

<style>
  .b-tab-panels {
    flex: 1 1 auto;
    min-width: 0;
    overflow: var(--tabs-overflow, hidden);
  }

  .b-tab-panels__track {
    display: grid;
  }
</style>
