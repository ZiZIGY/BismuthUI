import { cva } from 'class-variance-authority';

/** Which way the box can be pulled, and therefore where its grip sits. */
export type TResizeAxis = 'both' | 'horizontal' | 'vertical';

export const resizableVariants = cva('b-resizable relative', {
  variants: {
    axis: {
      both: 'b-resizable--both',
      horizontal: 'b-resizable--horizontal',
      vertical: 'b-resizable--vertical',
    },
    disabled: { true: 'b-resizable--disabled' },
  },
  defaultVariants: { axis: 'both' },
});

export interface IResizableProps {
  axis?: TResizeAxis;
  disabled?: boolean;
  /** Named for a screen reader, which has only the grip to go on. */
  label?: string;
}
