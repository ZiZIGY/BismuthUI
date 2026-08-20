/**
 * Which way the content travels. A bar is only ever one of the two — `both`
 * puts up one of each, and they keep out of each other's corner.
 */
export type TScrollAxis = 'vertical' | 'horizontal';

export interface IScrollbarProps {
  /** The element whose native bar is hidden and whose scroll this reports. */
  target?: HTMLElement | null;
  axis?: TScrollAxis;
}

/**
 * When a bar is on screen. `auto` puts one up only while there is something to
 * scroll; `always` keeps it whether or not there is; `hover` keeps it out of
 * the way until the pointer, the focus or a scroll asks for it.
 */
export type TScrollVisibility = 'auto' | 'always' | 'hover';

export interface IScrollAreaProps {
  axis?: TScrollAxis | 'both';
  visibility?: TScrollVisibility;
}
