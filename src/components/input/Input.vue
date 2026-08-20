<script setup lang="ts">
  import { computed } from 'vue';
  import BField from '../field/Field.vue';
  import BFieldAddon from '../field/FieldAddon.vue';
  import { useFieldControl } from '../field/useFieldControl';
  import type { IFieldProps } from '../field';

  defineOptions({ name: 'BInput', inheritAttrs: false });

  /**
   * A text control wrapped in the shared field shell. Everything visual — the
   * frame, the leader with its caption, the slots — belongs to `BField`, which
   * selects and autocompletes reuse as they land.
   */
  const props = defineProps<IFieldProps>();

  const { attrs, controlId, controlAttributes } = useFieldControl();
  const model = defineModel<string>();

  /*
   * `props` holds every declared prop at runtime, `modelValue` among them, so
   * spreading it onto the shell would write the value out as an attribute.
   * Only what the shell answers for is handed over.
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
    :class="attrs.class as string"
  >
    <BFieldAddon v-if="$slots.left">
      <slot name="left" />
    </BFieldAddon>

    <input
      :id="controlId"
      v-model="model"
      class="b-field__field h-full bg-transparent outline-none"
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
