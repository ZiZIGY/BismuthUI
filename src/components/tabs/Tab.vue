<script setup lang="ts">
  import { computed, inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
  import { vRipple } from '../../directives/ripple';
  import { TABS_CONTEXT, type ITabsItem, type ITabProps } from '.';

  defineOptions({ name: 'BTab' });

  /**
   * One tab. It enrols with the root on mount so the strip can walk the row on
   * an arrow key, and stands down on unmount — a tab behind a `v-if` leaves no
   * hole in the order.
   *
   * The chosen one takes the accent and a wash of it, the rest are nothing at
   * all, the way a ghost button is nothing until reached for.
   */
  const props = defineProps<ITabProps>();

  const context = inject(TABS_CONTEXT);

  const button = useTemplateRef<HTMLButtonElement>('button');

  const active = computed(() => context?.active.value === props.value);

  let enrolled: ITabsItem | undefined;

  onMounted(() => {
    if (!button.value) return;

    enrolled = { value: props.value, el: button.value };
    context?.register(enrolled);
  });

  onBeforeUnmount(() => {
    if (enrolled) context?.release(enrolled);
  });
</script>

<template>
  <button
    :id="`${context?.name}-tab-${value}`"
    ref="button"
    v-ripple="!disabled"
    type="button"
    class="b-tab"
    :class="{ 'b-tab--active': active }"
    role="tab"
    :aria-controls="`${context?.name}-panel-${value}`"
    :aria-selected="active"
    :tabindex="active ? 0 : -1"
    :disabled
    @click="context?.select(value)"
  >
    <slot :active />
  </button>
</template>

<style>
  /*
   * Lifted above the frame, which is positioned and would otherwise paint over
   * it whatever the markup order.
   *
   * The bevel is the same hexagon the option row is cut from, and the padding
   * clears it — text pushed into a bevel is text with a corner through it.
   */
  .b-tab {
    position: relative;
    z-index: 1;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    height: var(--tabs-height);
    padding-inline: calc(var(--frame-slant) + var(--tabs-pad));
    color: var(--b-muted);
    font: inherit;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 0;
    transition:
      color 0.15s ease,
      background 0.15s ease;
    clip-path: polygon(
      0 50%,
      var(--frame-slant) 0,
      calc(100% - var(--frame-slant)) 0,
      100% 50%,
      calc(100% - var(--frame-slant)) 100%,
      var(--frame-slant) 100%
    );
  }

  .b-tabs--vertical .b-tab {
    justify-content: flex-start;
  }

  .b-tab--active {
    color: var(--tabs-accent);
    background: color-mix(in oklab, var(--tabs-accent) 12%, transparent);
  }

  .b-tab:not(.b-tab--active):not(:disabled):hover {
    color: var(--b-text);
  }

  /*
   * Choosing follows the focus, so the chosen tab is always the focused one
   * and the two states would say the same thing. What the keyboard gets is the
   * same wash, deepened — enough to tell the strip is being driven.
   */
  .b-tab:focus-visible {
    outline: none;
    background: color-mix(in oklab, var(--tabs-accent) 20%, transparent);
  }

  .b-tab:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
</style>
