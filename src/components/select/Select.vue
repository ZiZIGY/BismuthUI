<script setup lang="ts">
  import { computed, ref, useTemplateRef } from 'vue';
  import { useElementSize } from '@vueuse/core';
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

  const chips = useTemplateRef<HTMLElement>('chips');

  /*
   * The height the chips actually need, measured rather than declared. A box
   * left at `height: auto` has no number to travel between, so it jumps a
   * whole row the moment one wraps; handed a figure, motion can spring it.
   *
   * The measurement is of an inner element that is always `auto`, never of the
   * box being animated — reading the height of the thing you are also setting
   * the height on is a loop.
   */
  const { height: chipsHeight } = useElementSize(chips);

  /*
   * The row is sprung to the height its chips turn out to need. Not while that
   * is zero, though — an empty select has nothing to measure, and holding the
   * row at nothing collapses the field to a sliver. Left alone it falls back
   * to the floor the stylesheet gives it, which is one row.
   */
  const grown = computed(() =>
    chipsHeight.value ? { height: chipsHeight.value } : undefined
  );

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
        multiline
      >
        <BFieldAddon v-if="$slots.left">
          <slot name="left" />
        </BFieldAddon>

        <motion.div
          :animate="grown"
          :transition="SPRING"
          class="b-field__field b-select__value"
          role="combobox"
          :aria-label="label"
          :tabindex="disabled ? -1 : 0"
          :aria-expanded="open"
          :aria-disabled="disabled || undefined"
          :aria-multiselectable="multiple || undefined"
          @keydown.space.prevent="toggle"
        >
          <span
            ref="chips"
            class="b-select__chips"
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
          </span>

        </motion.div>

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

  /*
   * Many values wrap and the field grows to hold them, which is the whole of
   * the behaviour: no maximum is set here, so it grows for as long as there is
   * something to show.
   *
   * A ceiling is the caller's to set, and they set it the plain way — a
   * `max-height` on the select. It lands on the outermost element, so it is
   * handed down from there rather than read in script: `inherit` carries it to
   * the box and to this row, and the overflow it creates is what the counter
   * counts. Nothing here has to know the figure, which is the point — it can
   * be any unit, a clamp, or a media query, and none of that would survive
   * being measured and copied.
   *
   * `min-width: 0` because a flex item will not shrink below its content by
   * default, and one long label would otherwise push the field wider than the
   * space it was given rather than wrapping inside it.
   */
  .b-select__value {
    align-items: flex-start;
    min-width: 0;
    max-height: inherit;
    /*
     * One row's worth, always. The height is sprung to whatever the chips
     * measure, and an empty select measures nothing — without a floor the row
     * would collapse and take the field with it.
     */
    min-height: var(--field-line, 1.4em);
  }

  /*
   * The chips, and the element the height is read from. It is never given a
   * height of its own — that is the whole point of it: the box outside is
   * animated to whatever this one turns out to be, and measuring the element
   * you are also sizing would be a loop.
   */
  .b-select__chips {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45em;
    row-gap: 0.35em;
    min-width: 0;
  }



  /*
   * Every step between the select and the row repeats it: `inherit` takes the
   * parent's computed value, and a parent that never declared `max-height` has
   * `none` to give. One missing link and the ceiling stops there.
   */
  .b-select__field,
  .b-select__field .b-field__box {
    max-height: inherit;
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
