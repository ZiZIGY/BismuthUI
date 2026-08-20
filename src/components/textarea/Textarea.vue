<script setup lang="ts">
  import { computed } from 'vue';
  import BField from '../field/Field.vue';
  import BFieldAddon from '../field/FieldAddon.vue';
  import { useFieldControl } from '../field/useFieldControl';
  import type { IFieldProps } from '../field';

  defineOptions({ name: 'BTextarea', inheritAttrs: false });

  /**
   * The same shell as the input, with a control that spans rows. The shape
   * follows: one row is the input hexagon, and every row after that pulls the
   * tips apart into cut corners.
   */
  const props = defineProps<Omit<IFieldProps, 'multiline'>>();

  const { attrs, controlId, controlAttributes } = useFieldControl();
  const model = defineModel<string>();

  /*
   * `props` holds every declared prop at runtime, `modelValue` among them, so
   * spreading it would write the value out as an attribute on the shell.
   */
  const shell = computed(() => ({
    variant: props.variant,
    size: props.size,
    disabled: props.disabled,
    label: props.label,
    required: props.required,
    accent: props.accent,
  }));
</script>

<template>
  <BField
    v-bind="shell"
    multiline
    :class="attrs.class as string"
  >
    <BFieldAddon v-if="$slots.left">
      <slot name="left" />
    </BFieldAddon>

    <textarea
      :id="controlId"
      v-model="model"
      class="b-field__field bg-transparent outline-none"
      placeholder=" "
      :disabled
      :required
      v-bind="controlAttributes"
    />

    <BFieldAddon
      v-if="$slots.right"
      align="inline-end"
    >
      <slot name="right" />
    </BFieldAddon>

    <slot />
  </BField>
</template>
