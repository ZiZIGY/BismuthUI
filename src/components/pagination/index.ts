import { cva } from 'class-variance-authority';
import type { TSize } from '../../theme/types';

export const paginationVariants = cva('b-pagination flex items-center', {
  variants: {
    size: {
      xs: 'b-pagination--xs',
      sm: 'b-pagination--sm',
      md: 'b-pagination--md',
      lg: 'b-pagination--lg',
      xl: 'b-pagination--xl',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface IPaginationProps {
  /** How many pages there are. */
  total: number;
  /** How many pages stand either side of the current one before a break. */
  siblings?: number;
  size?: TSize;
  /** The step arrows at the ends. */
  arrows?: boolean;
}
