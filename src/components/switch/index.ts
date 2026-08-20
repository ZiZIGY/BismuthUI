import { cva } from 'class-variance-authority';
import type { TSize } from '../../theme/types';

export const switchVariants = cva(
  [
    'b-switch relative inline-flex cursor-pointer items-center gap-3',
    'appearance-none border-0 bg-transparent p-0 text-left select-none',
    'text-(--b-text)',
  ],
  {
    variants: {
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-45 saturate-[0.12]',
      },
    },
  },
);

export interface ISwitchProps {
  size?: TSize;
  disabled?: boolean;
  /** Colour of the handle and of the track once it is on. */
  accent?: string;
  /** Text next to the track. */
  label?: string;
}
