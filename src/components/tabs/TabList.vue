<script setup lang="ts">
  import { computed, inject } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import { TABS_CONTEXT } from '.';

  defineOptions({ name: 'BTabList' });

  /**
   * The strip. It wears the frame — contour and plate — and the tabs are cut
   * out of it; what goes in it is the caller's business, so a search box or a
   * spacer beside the tabs costs nothing.
   *
   * The keyboard lives here rather than on a tab, because a tab strip answers
   * as one control: arrows move between tabs, and the tab key steps past the
   * lot to whatever comes next. That is the roving tabindex, and it is why a
   * key pressed on one tab has to be able to reach its neighbours.
   *
   * Choosing follows the focus, which is what makes the strip feel like one
   * control rather than a row of buttons — so moving is done by pressing the
   * neighbour rather than by telling the root: one path in, and the tab's own
   * guard against being chosen while disabled is on it.
   */
  const context = inject(TABS_CONTEXT);

  const vertical = computed(
    () => context?.orientation.value === 'vertical'
  );

  function onKeydown(event: KeyboardEvent) {
    const tabs = (context?.items.value ?? []).filter((item) => !item.el.disabled);
    if (!tabs.length) return;

    const back = vertical.value ? 'ArrowUp' : 'ArrowLeft';
    const forward = vertical.value ? 'ArrowDown' : 'ArrowRight';

    const from = tabs.findIndex((item) => item.el === document.activeElement);
    let at = -1;

    if (event.key === back) at = from - 1;
    else if (event.key === forward) at = from + 1;
    else if (event.key === 'Home') at = 0;
    else if (event.key === 'End') at = tabs.length - 1;
    else return;

    event.preventDefault();

    const target = tabs[((at % tabs.length) + tabs.length) % tabs.length];
    target?.el.focus();
    target?.el.click();
  }
</script>

<template>
  <div
    class="b-tab-list"
    role="tablist"
    :aria-orientation="context?.orientation.value"
    @keydown="onKeydown"
  >
    <BFrame
      :blunt="vertical"
      :band="false"
      :glow="false"
    />

    <slot />
  </div>
</template>

<style>
  /*
   * The padding is the frame's own contour, which the tabs must not sit on top
   * of. Positioned, because the frame inside it is.
   */
  .b-tab-list {
    position: relative;
    display: flex;
    flex: none;
    padding: var(--b-stroke, 1.4px);
    font-size: var(--tabs-font);
  }

  .b-tabs--vertical .b-tab-list {
    flex-direction: column;
  }
</style>
