<script setup lang="ts">
  import { computed, provide, shallowRef, toRef, useId } from 'vue';
  import { cn } from '../../utils/cn';
  import {
    TABS_CONTEXT,
    tabsVariants,
    type ITabsItem,
    type ITabsProps,
  } from '.';

  defineOptions({ name: 'BTabs' });

  /**
   * The root. It holds the chosen value, the orientation and the roll of tabs,
   * and lays out whatever is put in it — which is meant to be a `BTabList` and
   * a `BTabPanels`, in that order, but the box is the caller's to arrange.
   *
   * Nothing is composed for you here on purpose: the strip, the tabs and the
   * panels are separate components so a page can put a search box in the strip
   * or a border round the panels without the library having grown a prop for
   * it. What the root keeps is the part that cannot be done in markup — one
   * chosen value, shared by things that are not each other's children.
   *
   * Tabs enrol themselves as they mount. That roll is what the strip walks on
   * an arrow key, and what settles which tab stands in when no value has been
   * set — the first one that can be chosen, so a `BTabs` with no `v-model` at
   * all still shows something rather than an empty box.
   */
  const props = withDefaults(defineProps<ITabsProps>(), {
    size: 'md',
    orientation: 'horizontal',
  });

  const model = defineModel<string | number>();

  const name = useId();
  const items = shallowRef<readonly ITabsItem[]>([]);

  /*
   * A stand-in rather than a value written back. Setting the model on mount
   * would be the component changing its own binding before being asked to, and
   * a form would see an edit nobody made.
   */
  const active = computed(() =>
    model.value === undefined
      ? items.value.find((item) => !item.el.disabled)?.value
      : model.value
  );

  provide(TABS_CONTEXT, {
    name,
    active,
    orientation: toRef(props, 'orientation'),
    items,
    select: (value) => {
      model.value = value;
    },
    register: (item) => {
      items.value = [...items.value, item];
    },
    release: (item) => {
      items.value = items.value.filter((held) => held !== item);
    },
  });
</script>

<template>
  <div :class="cn(tabsVariants({ orientation }), `b-tabs--${size}`)">
    <slot />
  </div>
</template>

<style>
  .b-tabs--xs {
    --tabs-height: 26px;
    --tabs-font: 11px;
    --tabs-pad: 0.55em;
    --tabs-space: 10px;
  }

  .b-tabs--sm {
    --tabs-height: 30px;
    --tabs-font: 12px;
    --tabs-pad: 0.6em;
    --tabs-space: 12px;
  }

  .b-tabs--md {
    --tabs-height: 36px;
    --tabs-font: 13px;
    --tabs-pad: 0.7em;
    --tabs-space: 14px;
  }

  .b-tabs--lg {
    --tabs-height: 42px;
    --tabs-font: 15px;
    --tabs-pad: 0.8em;
    --tabs-space: 16px;
  }

  .b-tabs--xl {
    --tabs-height: 50px;
    --tabs-font: 16px;
    --tabs-pad: 0.9em;
    --tabs-space: 20px;
  }

  :where(.b-tabs) {
    --tabs-accent: var(--b-tone, var(--b-text));
    --tabs-travel: 0.34s;
    --tabs-ease: cubic-bezier(0.2, 0.8, 0.3, 1);
    --frame-line: var(--b-line);
    --frame-fill: var(--b-elevated);
    --frame-slant: calc(var(--tabs-height) / 2);

    gap: var(--tabs-space);
  }
</style>
