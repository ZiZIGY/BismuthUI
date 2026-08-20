import { ref } from 'vue';

/**
 * Which list is on screen. Two panels cannot be ordered against each other:
 * flush, a trigger paints over its own panel, so a second list would have to be
 * under the field it belongs to and over the panel of the first at the same
 * time. So there is only ever one — whoever opens says so here, and the list it
 * displaces goes at once instead of sinking behind the field that replaced it.
 *
 * The element rather than a name, so a list opening inside another one can be
 * told apart from a list opening beside it.
 */
export const openList = ref<HTMLElement | null>(null);
