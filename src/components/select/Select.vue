<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { AnimatePresence, motion } from 'motion-v';
  import BDropdown from '../dropdown/Dropdown.vue';
  import BField from '../field/Field.vue';
  import BFieldAddon from '../field/FieldAddon.vue';
  import BOption from '../option/Option.vue';
  import BScrollArea from '../scroll-area/ScrollArea.vue';
  import { toOption, type IOption } from '../option';
  import { SPRING } from '../../theme/motion';
  import type { ISelectProps, TSelectValue } from '.';

  defineOptions({ name: 'BSelect', inheritAttrs: false });

  /**
   * A field that is read rather than typed into, with a list under it.
   * Everything else is already built: the shell comes from `BField`, the panel
   * from `BDropdown`, the rows from `BOption`.
   *
   * The value is a plain element, not an input. There is nothing to type into
   * it, and what stands there is the caller's business — labels by default,
   * chips or avatars or counts through the `value` slot.
   *
   * That slot is given one option at a time rather than the whole list, so the
   * arriving and departing of each is ours to animate whatever the caller
   * draws inside it.
   */
  const props = withDefaults(defineProps<ISelectProps>(), { size: 'md' });

  const model = defineModel<TSelectValue>();
  const open = defineModel<boolean>('open', { default: false });

  const options = computed(() => props.options.map(toOption));

  /** One shape for both modes, so nothing below has to ask which one it is. */
  const picked = computed<readonly (string | number)[]>(() => {
    if (Array.isArray(model.value)) return model.value;
    return model.value === undefined || model.value === '' ? [] : [model.value];
  });

  /*
   * Rows can be taken over by a slot, and then `options` is not the whole
   * story — it may be empty while the list shows plenty. So whatever came
   * through `choose` is kept, and a value is looked up in both. Failing both,
   * the value stands in for its own label rather than showing nothing.
   */
  const seen = ref<IOption[]>([]);

  const chosen = computed(() =>
    picked.value.map(
      (value) =>
        options.value.find((option) => option.value === value) ??
        seen.value.find((option) => option.value === value) ?? {
          value,
          label: String(value),
        }
    )
  );

  /*
   * An open list counts as the field being in use, whoever holds the focus. The
   * panel is a sibling of the field rather than a child of it, so a search box
   * standing in it takes the focus clean out of `:focus-within`, and the caption
   * would drop back into a field plainly being worked in.
   */
  const inUse = computed(() => chosen.value.length > 0 || open.value);

  function toggle() {
    if (!props.disabled) open.value = !open.value;
  }

  function choose(option: IOption) {
    seen.value = [
      ...seen.value.filter((known) => known.value !== option.value),
      option,
    ];

    if (!props.multiple) {
      model.value = option.value;
      open.value = false;
      return;
    }

    /* picking again clears the row, so the list is its own undo */
    model.value = picked.value.includes(option.value)
      ? picked.value.filter((value) => value !== option.value)
      : [...picked.value, option.value];
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
      <BField
        class="b-select__field"
        :variant
        :label
        :size
        :disabled
        :filled="inUse"
      >
        <BFieldAddon v-if="$slots.left">
          <slot name="left" />
        </BFieldAddon>

        <div
          class="b-field__field b-select__value"
          role="combobox"
          :aria-label="label"
          :tabindex="disabled ? -1 : 0"
          :aria-expanded="open"
          :aria-disabled="disabled || undefined"
          :aria-multiselectable="multiple || undefined"
          @keydown.space.prevent="toggle"
        >
          <AnimatePresence
            mode="popLayout"
            :initial="false"
          >
            <motion.span
              v-for="option in chosen"
              :key="option.value"
              layout
              class="b-select__item"
              :initial="{ opacity: 0, scale: 0.7 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.7 }"
              :transition="SPRING"
            >
              <slot
                name="value"
                :option
              >
                {{ option.label }}
              </slot>
            </motion.span>
          </AnimatePresence>
        </div>

        <BFieldAddon align="inline-end">
          <slot name="right" />
          <span
            class="b-select__caret"
            aria-hidden="true"
          />
        </BFieldAddon>
        <slot />
      </BField>
    </template>

    <div v-if="$slots.head">
      <slot name="head" />
    </div>

    <BScrollArea>
      <slot
        name="options"
        :options
        :picked
        :choose
      >
        <BOption
          v-for="option in options"
          :key="option.value"
          :selected="picked.includes(option.value)"
          :disabled="option.disabled"
          @click="choose(option)"
        >
          {{ option.label }}
        </BOption>
      </slot>
    </BScrollArea>

    <div v-if="$slots.foot">
      <slot name="foot" />
    </div>
  </BDropdown>
</template>

<style>
  /* there is nothing to place a caret in, so the whole field reads as a button */
  .b-select__field {
    cursor: pointer;
  }

  /* nothing to type here, so it lays its contents out instead of holding text */
  .b-select__value {
    /*
     * Positioned, because a value on its way out is held against this box, and
     * stretched, because by then it may be the only thing left in it: taken out
     * of the flow, the last value leaves nothing to give the box a height, and
     * a box of no height would clip the very farewell it is holding.
     */
    position: relative;
    align-self: stretch;
    display: flex;
    align-items: center;
    gap: 0.45em;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
    outline: none;
  }

  .b-select__item {
    display: inline-flex;
    flex: none;
    align-items: center;
  }

  /*
   * A square turned 45deg with two adjacent borders — the same figure the
   * focus brackets are made of, pointed down and flipped when the list opens.
   */
  .b-select__caret {
    width: 0.5em;
    height: 0.5em;
    margin-bottom: 0.25em;
    border-right: 1.4px solid currentColor;
    border-bottom: 1.4px solid currentColor;
    transform: rotate(45deg);
    transition: transform 0.2s ease;
  }

  .b-dropdown--open .b-select__caret {
    transform: rotate(225deg) translate(-0.15em, -0.15em);
  }
</style>
