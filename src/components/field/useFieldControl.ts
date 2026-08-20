import { computed, inject, useAttrs } from 'vue';
import { FIELD_CONTROL_ID } from '.';

/**
 * What a control inside the field shell needs, and every wrapper needs the
 * same: the id the shell's caption points at, and the attributes meant for the
 * control rather than for the shell around it — the class being the one thing
 * that belongs to the shell.
 */
export function useFieldControl() {
  const attrs = useAttrs();

  const controlAttributes = computed(() => {
    const { class: _ignoredClass, ...rest } = attrs;
    return rest;
  });

  return {
    attrs,
    controlId: inject(FIELD_CONTROL_ID, undefined),
    controlAttributes,
  };
}