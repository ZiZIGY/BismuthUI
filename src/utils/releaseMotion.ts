import { mountedStates } from 'motion-v';

/**
 * Finishes off motion-v's elements inside a box a `<Transition>` has just
 * taken out of the page.
 *
 * motion-v tears an element's state down on unmount only if the element is
 * already out of the document by then, and trusts its own `AnimatePresence`
 * with every other case. A `<Transition>` leave is the other case: the
 * component unmounts while its element stays for the exit, so the state — a
 * window listener among its parts, holding the element — was left behind for
 * good, once per closing. Called from `after-leave`, when the box is gone,
 * this does what motion-v would have done had the element been detached in
 * time.
 */
export function releaseMotion(root: Element) {
  for (const node of [root, ...root.querySelectorAll('*')]) {
    mountedStates.get(node)?.unmount();
  }
}
