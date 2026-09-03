import { cva } from 'class-variance-authority';
import type { TSize } from '../../theme/types';

export const progressVariants = cva('b-progress relative w-full', {
  variants: {
    reverse: { true: 'b-progress--reverse' },
    indeterminate: { true: 'b-progress--indeterminate' },
  },
});

export interface IProgressProps {
  /** Fill in percent, 0..100. Omit for an indeterminate bar. */
  value?: number;
  size?: TSize;
  /** Fill from right to left. */
  reverse?: boolean;
  /**
   * Marks along the track, in per cent. `true` puts one every tenth, a number
   * puts one every N per cent, and an array places them at the given figures —
   * a bar divided into the stages it actually has rather than into equal
   * slices.
   *
   * A generated run leaves the ends bare, since the bar's own points already
   * stand for nought and a hundred. An array is taken literally.
   */
  ticks?: boolean | number | readonly number[];
}
