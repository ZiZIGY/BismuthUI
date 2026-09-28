import { onClickOutside, onKeyStroke, useEventListener } from '@vueuse/core';
import { watch, type Ref, type ShallowRef } from 'vue';

/**
 * Three ways of saying "done with this": a click landing elsewhere, Escape, or
 * the focus leaving for good. The last one needs the relatedTarget rather than
 * a plain blur — moving between a field and a button inside the same group is
 * not leaving it.
 *
 * The click elsewhere is heard on the window, and only while there is
 * something open to close. A form of twenty selects would otherwise run
 * twenty window listeners on every click anywhere on the page, each closing
 * a list that was never open. The other two sit on the dropdown's own element
 * and cost nothing until something happens there.
 */
export function useDismiss(
  root: Readonly<ShallowRef<HTMLElement | null>>,
  isOpen: Ref<boolean>
) {
  const close = () => (isOpen.value = false);

  watch(
    isOpen,
    (open, _, onCleanup) => {
      if (open) onCleanup(onClickOutside(root, close));
    },
    { immediate: true }
  );

  onKeyStroke('Escape', close, { target: root });

  useEventListener(root, 'focusout', (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !root.value?.contains(next)) close();
  });
}
