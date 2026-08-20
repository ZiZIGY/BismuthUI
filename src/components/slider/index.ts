import { cva } from 'class-variance-authority';
import type { TSize } from '../../theme/types';

/** Keyboard and pointer states are native, so only disabled needs a class. */
export const sliderVariants = cva(
  ['b-slider relative flex w-full items-center', 'touch-none select-none'],
  {
    variants: {
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-45 saturate-[0.12]',
      },
    },
  },
);

export interface ISliderProps {
  min?: number;
  max?: number;
  step?: number;
  size?: TSize;
  disabled?: boolean;
  /** Colour of the thumb, halo and focus. */
  accent?: string;
  /** Accessible name for the handle. */
  label?: string;
  /**
   * When the bubble over a handle is shown. Left out, there is no bubble.
   *
   * `drag` follows whichever handle is held or focused; `always` pins every
   * bubble open; `active` shows only the handle being used, which is what a
   * range wants when its two readouts would otherwise collide.
   */
  thumbLabel?: TThumbLabel;
  /**
   * Marks along the track. `true` puts one on every step, a number puts one
   * every N steps, and an array places them at the given values — a scale can
   * be marked at the figures worth reading rather than at all of them.
   */
  ticks?: boolean | number | readonly number[];
}

/** When a handle carries its bubble. */
export type TThumbLabel = 'drag' | 'always' | 'active';
