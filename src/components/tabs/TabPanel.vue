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
   * Out of the flow and stretched to the box, which is the whole of why it
   * clears. `inset: 0` and not just a corner: a panel left at its own height
   * travels its own height, so a short one waiting after a tall one comes to
   * rest inside the box and shows through. Pinned to all four sides it is
   * exactly the box, and one box away is always out.
   *
   * Nothing fades. A panel parked one box out is already past a clipping edge,
   * so it is gone on the geometry alone — dimming it as well would be a panel
   * sliding in while it is still becoming visible, two effects arguing.
   */
  .b-tab-panel {
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: transform var(--tabs-travel) var(--tabs-ease);
  }

  /*
   * Which side it waits on comes out of the markup rather than out of a
   * variable: a panel after the chosen one waits ahead, anything else waits
   * behind, and `~` is the whole of that rule. Nothing has to remember which
   * way the last move went, and a jump across three tabs slides exactly like a
   * step across one.
   */
  .b-tabs--horizontal .b-tab-panel {
    transform: translateX(-100%);
  }

  .b-tabs--horizontal .b-tab-panel--active ~ .b-tab-panel {
    transform: translateX(100%);
  }

  .b-tabs--vertical .b-tab-panel {
    transform: translateY(-100%);
  }

  .b-tabs--vertical .b-tab-panel--active ~ .b-tab-panel {
    transform: translateY(100%);
  }

  /*
   * The one in the flow, and so the one the box takes its height from. Written
   * after the two pairs above and at the same weight, which is what puts it on
   * top of them.
   */
  .b-tabs--horizontal .b-tab-panel--active,
  .b-tabs--vertical .b-tab-panel--active {
    position: relative;
    pointer-events: auto;
    transform: translate(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .b-tab-panel {
      transition: none;
    }
  }
</style>
