export type TTooltipSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Where the tooltip is asked to stand. `auto` picks whichever side has the
 * most room to begin with; a named side is a preference rather than an order —
 * it is tried first, given up for its opposite the moment it does not fit, and
 * failing that for whichever side actually has room. The slider's bubble never
 * has to ask this — it is always above the handle — which is the one thing a
 * tooltip needs that the bubble did not.
 */
export type TTooltipPlacement = 'auto' | TTooltipSide;

export interface ITooltipProps {
  placement?: TTooltipPlacement;
  /** How long the pointer or the focus has to rest before it shows, in ms. */
  delay?: number;
  disabled?: boolean;
}
