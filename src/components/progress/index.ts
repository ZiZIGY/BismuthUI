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
}
