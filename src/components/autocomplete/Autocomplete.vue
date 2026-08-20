<script setup lang="ts">
  import { computed } from 'vue';
  import BDropdown from '../dropdown/Dropdown.vue';
  import BInput from '../input/Input.vue';
  import BOption from '../option/Option.vue';
  import BScrollArea from '../scroll-area/ScrollArea.vue';
  import { toOption, type IOption } from '../option';
  import type { IAutocompleteProps } from '.';

  defineOptions({ name: 'BAutocomplete', inheritAttrs: false });

  /**
   * A field that completes what is typed into it: the same shell as the input,
   * the same panel as the select, and a list narrowed by the text so far.
   *
   * The model is the text, not a chosen value — that is what tells this apart
   * from the select. Anything may be typed; the list is help, not a gate. What
   * was picked from it comes out of `select`, with the whole option.
   *
   * Nothing here opens the list: the panel watches its own trigger and opens
   * whenever a control that takes typing is used.
   *
   * The rows are a slot with the filtered list as its fallback — keep passing
   * `options` and nothing changes, or take it over and put groups, buttons,
   * anything at all in their place, with `choose` handed along. Nothing is said
   * about an empty result unless someone says it: with no rows and no word, the
   * panel has nothing to show and does not open at all.
   */
  const props = withDefaults(defineProps<IAutocompleteProps>(), { size: 'md' });

  const emit = defineEmits<{ select: [option: IOption] }>();

  const model = defineModel<string>({ default: '' });
  const open = defineModel<boolean>('open', { default: false });

  const options = computed(() => props.options.map(toOption));

  /*
   * Plain case-insensitive substring. An empty field is not a query, so it
   * shows everything rather than nothing.
   */
  const matches = computed(() => {
    const query = model.value.trim().toLowerCase();
    if (!query) return options.value;

    return options.value.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  });

  function choose(option: IOption) {
    model.value = option.label;
    open.value = false;
    emit('select', option);
  }
</script>

<template>
  <BDropdown
    v-model:open="open"
    flush
    :size
    v-bind="$attrs"
  >
    <template #trigger>
      <BInput
        v-model="model"
        :variant
        :label
        :size
        :disabled
        :required
      >
        <template
          v-if="$slots.left"
          #left
        >
          <slot name="left" />
        </template>

        <template
          v-if="$slots.right"
          #right
        >
          <slot name="right" />
        </template>

        <slot />
      </BInput>
    </template>

    <div v-if="$slots.head">
      <slot name="head" />
    </div>

    <BScrollArea>
      <slot
        name="options"
        :options="matches"
        :choose
      >
        <BOption
          v-for="option in matches"
          :key="option.value"
          :selected="option.label === model"
          :disabled="option.disabled"
          @click="choose(option)"
        >
          <slot
            name="option"
            :option
            >{{ option.label }}</slot
          >
        </BOption>
      </slot>
    </BScrollArea>

    <p
      v-if="$slots.empty && !matches.length"
      class="b-dropdown__empty"
    >
      <slot name="empty" />
    </p>

    <div v-if="$slots.foot">
      <slot name="foot" />
    </div>
  </BDropdown>
</template>