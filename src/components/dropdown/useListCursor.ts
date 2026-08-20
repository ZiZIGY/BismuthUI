import { nextTick, ref, watch, type Ref, type ShallowRef } from 'vue';

/**
 * Rows are read from the DOM rather than registered. They arrive through a
 * slot, in whatever shape the caller likes, and all the walk needs of them is
 * an order; disabled ones drop out of it, so it cannot stall on one.
 */
const ROW_SELECTOR = '.b-option:not([disabled])';

/**
 * A cursor over a list that is walked without being focused. The trigger keeps
 * the focus — a text field is still being typed into — so the current row is
 * marked with `data-active` instead, and the pointer moves the very same
 * cursor, which is what keeps hover and keyboard from disagreeing.
 */
export function useListCursor(
  container: Readonly<ShallowRef<HTMLElement | null>>,
  isOpen: Ref<boolean>
) {
  const index = ref(-1);

  function rows(): HTMLElement[] {
    const found = container.value?.querySelectorAll<HTMLElement>(ROW_SELECTOR);
    return Array.from(found ?? []);
  }

  /*
   * `reveal` is what tells the two input methods apart. A key press moves the
   * cursor to a row that may be out of sight, so the list has to follow it. A
   * pointer is already on the row it picked, and scrolling then would drag the
   * list out from under it — hovering the half-visible last row would jump it
   * into place and take the pointer with it.
   */
  function moveTo(target: number, reveal = true) {
    const items = rows();
    if (!items.length) return;

    /* the walk wraps, so holding an arrow never dead-ends */
    const next = (target + items.length) % items.length;
    items.forEach((item, position) =>
      item.toggleAttribute('data-active', position === next)
    );
    if (reveal) items[next].scrollIntoView({ block: 'nearest' });
    index.value = next;
  }

  /** Opens first if it has to: rows exist only once the list is mounted. */
  async function step(by: number) {
    if (!isOpen.value) {
      isOpen.value = true;
      await nextTick();
      moveTo(by > 0 ? 0 : -1);
      return;
    }
    moveTo(index.value + by);
  }

  /*
   * The cursor is wherever the pointer is, and nowhere when it is not on a row
   * at all: crossing into a search field or a row of actions leaves the list
   * with a row still lit and nothing under the pointer to explain it.
   */
  function follow(event: Event) {
    const target = event.target as HTMLElement | null;
    const row = target?.closest<HTMLElement>(ROW_SELECTOR);

    if (row) moveTo(rows().indexOf(row), false);
    /* only when there is something to put out: this runs on every move */
    else if (index.value >= 0) reset();
  }

  /** Presses the current row, reporting whether there was one to press. */
  function press(): boolean {
    const item = rows()[index.value];
    item?.click();
    return Boolean(item);
  }

  /*
   * The mark comes off the row as well as out of the count. It is an attribute
   * in the DOM rather than a rendered class — that is what keeps the walk from
   * re-rendering the list on every step — so forgetting it here is what leaves
   * a row lit with the pointer long gone.
   */
  function reset() {
    container.value
      ?.querySelectorAll<HTMLElement>('[data-active]')
      .forEach((item) => item.removeAttribute('data-active'));

    index.value = -1;
  }

  watch(isOpen, reset);

  return { index, step, follow, press, reset };
}
