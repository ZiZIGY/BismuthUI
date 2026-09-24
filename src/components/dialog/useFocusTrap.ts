import { useEventListener } from '@vueuse/core';
import { type Ref, watch } from 'vue';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), ' +
  'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps the keyboard inside `root` while `active` is true, and hands the
 * focus back to whatever held it once `active` goes false.
 *
 * A native `<dialog>` opened with `showModal` does both for free, as part of
 * the top layer. A plain div does neither, and this is what stands in for
 * that half of the top layer's behaviour once the element is an ordinary one.
 */
export function useFocusTrap(
  root: Ref<HTMLElement | null>,
  active: Ref<boolean>
) {
  let held: HTMLElement | null = null;

  function focusables() {
    return Array.from(
      root.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
    );
  }

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (!active.value || event.key !== 'Tab') return;

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
   * Flushed after the DOM update, or the element is still `display: none` at
   * the moment this runs and `.focus()` on it does nothing. `root` itself is
   * the fallback sink, carrying `tabindex="-1"` for content with nothing
   * focusable in it.
   */
  watch(
    active,
    (value) => {
      if (value) {
        held = document.activeElement as HTMLElement | null;
        (focusables()[0] ?? root.value)?.focus();
      } else {
        held?.focus();
        held = null;
      }
    },
    { flush: 'post' }
  );
}
