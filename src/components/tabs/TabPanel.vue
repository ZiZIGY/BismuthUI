<script setup lang="ts">
  import { computed, inject } from 'vue';
  import { releaseMotion } from '../../utils/releaseMotion';
  import { TABS_CONTEXT, type ITabPanelProps } from '.';

  defineOptions({ name: 'BTabPanel' });

  /**
   * One panel, in the page only while it is chosen — and for as long as it
   * takes to slide out once it is not. Four tabs are one panel's worth of
   * DOM, and whatever a panel holds is built when it is first shown rather
   * than with the page. The price is state: a panel left behind forgets its
   * scroll position and its half-typed input.
   *
   * `<Transition>` rather than a class toggled on a panel that never leaves:
   * it is what keeps the outgoing one mounted until its own slide ends, reads
   * that end off the stylesheet, and lets it go at once when there is no
   * slide at all.
   */
  const props = defineProps<ITabPanelProps>();

  const context = inject(TABS_CONTEXT);

  const active = computed(() => context?.active.value === props.value);
</script>

<template>
  <Transition
    name="b-tab-panel"
    @after-leave="releaseMotion"
  >
    <div
      v-if="active"
      :id="`${context?.name}-panel-${value}`"
      class="b-tab-panel"
      role="tabpanel"
      :aria-labelledby="`${context?.name}-tab-${value}`"
    >
      <slot />
    </div>
  </Transition>
</template>

<style>
  /*
   * The one arriving and the one leaving share a cell, and so a size — which
   * is what makes `100%` mean one distance for both. Parked at their own
   * height instead, a short panel sliding in under a tall one would start
   * already inside the box.
   */
  .b-tab-panel {
    grid-area: 1 / 1;
  }

  .b-tab-panel-enter-active,
  .b-tab-panel-leave-active {
    transition: transform var(--tabs-travel) var(--tabs-ease);
  }

  .b-tab-panel-leave-active {
    pointer-events: none;
  }

  /*
   * Which side each comes from and goes to is read off the markup, not off a
   * remembered direction: the two are siblings, so whichever stands first in
   * the document is the one behind. The one arriving comes from ahead when
   * the one leaving precedes it, the one leaving goes ahead when the one
   * arriving precedes it, and otherwise both take the side behind. A jump
   * across three tabs slides exactly like a step across one.
   *
   * Transition classes rather than the panels' own: the outgoing element is
   * released by Vue as it was, never patched again, so a class describing
   * the choice would still say it is chosen all the way out.
   *
   * A box away and then some. Parked at exactly `100%` the two share an edge,
   * and mid-slide the last line of one sits against the first word of the
   * other — the gap is the air that keeps them from reading as one paragraph
   * in motion.
   */
  .b-tabs--horizontal .b-tab-panel-enter-from,
  .b-tabs--horizontal .b-tab-panel-leave-to {
    transform: translateX(calc(-100% - var(--tabs-slide-gap)));
  }

  .b-tabs--horizontal .b-tab-panel-leave-active ~ .b-tab-panel-enter-from,
  .b-tabs--horizontal .b-tab-panel-enter-active ~ .b-tab-panel-leave-to {
    transform: translateX(calc(100% + var(--tabs-slide-gap)));
  }

  .b-tabs--vertical .b-tab-panel-enter-from,
  .b-tabs--vertical .b-tab-panel-leave-to {
    transform: translateY(calc(-100% - var(--tabs-slide-gap)));
  }

  .b-tabs--vertical .b-tab-panel-leave-active ~ .b-tab-panel-enter-from,
  .b-tabs--vertical .b-tab-panel-enter-active ~ .b-tab-panel-leave-to {
    transform: translateY(calc(100% + var(--tabs-slide-gap)));
  }

  @media (prefers-reduced-motion: reduce) {
    .b-tab-panel-enter-active,
    .b-tab-panel-leave-active {
      transition: none;
    }
  }
</style>
