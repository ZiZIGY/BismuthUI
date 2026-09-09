<script setup lang="ts">
  import { computed, inject } from 'vue';
  import { TABS_CONTEXT, type ITabPanelProps } from '.';

  defineOptions({ name: 'BTabPanel' });

  /**
   * One panel. All of them stay mounted, so a panel out of view holds its
   * scroll position, its half-typed input and its open list; `inert` is what
   * keeps it out of reach while it waits — hidden to a screen reader and
   * skipped by the tab key, without being taken out of the page.
   */
  const props = defineProps<ITabPanelProps>();

  const context = inject(TABS_CONTEXT);

  const active = computed(() => context?.active.value === props.value);
</script>

<template>
  <div
    :id="`${context?.name}-panel-${value}`"
    class="b-tab-panel"
    :class="{ 'b-tab-panel--active': active }"
    role="tabpanel"
    :aria-labelledby="`${context?.name}-tab-${value}`"
    :inert="!active"
  >
    <slot :active />
  </div>
</template>

<style>
  /*
   * Every panel in the same cell, and so every panel the same size — which is
   * what makes `100%` mean one thing. In the flow rather than out of it: the
   * cell is measured from all of them together, so the box has a size before
   * anything is chosen and keeps it afterwards.
   *
   * Nothing fades. A panel parked one box out is already past a clipping edge,
   * so it is gone on the geometry alone — dimming it as well would be a panel
   * sliding in while it is still becoming visible, two effects arguing.
   *
   * What it does need is `visibility`, and the delay on it is the point. Sides
   * are read off the markup, so a step from the first tab to the third turns
   * the middle panel around: it was waiting ahead and now waits behind, and
   * the only way there is straight across the box in full view. Hidden while
   * it is neither chosen nor leaving, it makes that crossing unseen.
   *
   * The delay is what keeps the one leaving on screen. It becomes unchosen the
   * instant the value changes, and would vanish rather than slide out; held
   * for exactly as long as the slide, it goes the way it came and hides once
   * it is past the edge. The chosen one has no delay, so it appears at once.
   */
  .b-tab-panel {
    grid-area: 1 / 1;
    visibility: hidden;
    pointer-events: none;
    transition:
      transform var(--tabs-travel) var(--tabs-ease),
      visibility 0s linear var(--tabs-travel);
  }

  /*
   * Which side it waits on comes out of the markup rather than out of a
   * variable: a panel after the chosen one waits ahead, anything else waits
   * behind, and `~` is the whole of that rule. Nothing has to remember which
   * way the last move went, and a jump across three tabs slides exactly like a
   * step across one.
   *
   * A box away and then some. Parked at exactly `100%` two panels share an
   * edge, so mid-slide the last line of the one leaving sits against the first
   * word of the one arriving with nothing between them — the gap is the air
   * that keeps the two from reading as one paragraph in motion.
   */
  .b-tabs--horizontal .b-tab-panel {
    transform: translateX(calc(-100% - var(--tabs-slide-gap)));
  }

  .b-tabs--horizontal .b-tab-panel--active ~ .b-tab-panel {
    transform: translateX(calc(100% + var(--tabs-slide-gap)));
  }

  .b-tabs--vertical .b-tab-panel {
    transform: translateY(calc(-100% - var(--tabs-slide-gap)));
  }

  .b-tabs--vertical .b-tab-panel--active ~ .b-tab-panel {
    transform: translateY(calc(100% + var(--tabs-slide-gap)));
  }

  /*
   * Written after the two pairs above and at the same weight, which is what
   * puts it on top of them.
   */
  .b-tabs--horizontal .b-tab-panel--active,
  .b-tabs--vertical .b-tab-panel--active {
    visibility: visible;
    pointer-events: auto;
    transform: translate(0);
    transition:
      transform var(--tabs-travel) var(--tabs-ease),
      visibility 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .b-tab-panel {
      transition: none;
    }
  }
</style>
