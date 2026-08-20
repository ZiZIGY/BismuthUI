import { onClickOutside, onKeyStroke, useEventListener } from '@vueuse/core';
import type { Ref, ShallowRef } from 'vue';

/**
 * Three ways of saying "done with this": a click landing elsewhere, Escape, or
 * the focus leaving for good. The last one needs the relatedTarget rather than
 * a plain blur — moving between a field and a button inside the same group is
 * not leaving it.
 */
export function useDismiss(
  root: Readonly<ShallowRef<HTMLElement | null>>,
  isOpen: Ref<boolean>
) {
  const close = () => (isOpen.value = false);

  onClickOutside(root, close);
  onKeyStroke('Escape', close, { target: root });

  useEventListener(root, 'focusout', (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !root.value?.contains(next)) close();
  });
}
