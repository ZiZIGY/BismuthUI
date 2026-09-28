import { useEventListener } from '@vueuse/core';
import { onBeforeUnmount, onMounted, type Ref } from 'vue';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), ' +
  'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps the keyboard inside `root` for as long as the calling component is
 * mounted, and hands the focus back to whatever held it on unmount.
 *
 * A native `<dialog>` opened with `showModal` does both for free, as part of
 * the top layer. A plain div does neither, and this is what stands in for
 * that half of the top layer's behaviour once the element is an ordinary one.
 * Tied to the mount rather than to a flag: the window is mounted only while
 * open, so the listener exists only while there is something to trap.
 */
export function useFocusTrap(root: Readonly<Ref<HTMLElement | null>>) {
  let held: HTMLElement | null = null;

  function focusables() {
    return Array.from(
      root.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
    );
  }

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const items = focusables();

    /* nothing to land the wrap on but the sink itself, so Tab goes nowhere */
    if (!items.length) {
      event.preventDefault();
      return;
    }

    const [first] = items;
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /*
   * `root` itself is the fallback sink, carrying `tabindex="-1"` for content
   * with nothing focusable in it.
   */
  onMounted(() => {
    held = document.activeElement as HTMLElement | null;
    (focusables()[0] ?? root.value)?.focus();
  });

  onBeforeUnmount(() => held?.focus());
}
