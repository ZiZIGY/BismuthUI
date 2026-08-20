import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey } from 'vue';
import type { TSize } from '../../theme/types';

/** The id the shell's caption points at, for whichever control fills it. */
export const FIELD_CONTROL_ID: InjectionKey<string> = Symbol('b-field-control');

/**
 * States are resolved by selectors (`:focus-within`, `:placeholder-shown`,
 * `:has()`), so the only variant is the dressing: everything else a field does
 * is the same whichever one it wears.
 */
export const fieldVariants = cva(
  [
    'b-field relative w-full cursor-text',
    /*
     * Ordinary text colour. The role belongs to what reports state — the
     * caption and the contour under focus — not to the value the user typed.
     */
    'text-(--b-text)',
  ],
  {
    variants: {
      variant: {
        /* the signature shell: the frame, with its contour and its plate */
        frame: 'b-field--frame',
        /* a single rule under the control, for a field set into something else */
        line: 'b-field--line',
        /* nothing at all; the surround it sits in does the framing */
        ghost: 'b-field--ghost',
      },
    },
    defaultVariants: { variant: 'frame' },
  }
);

export type TFieldVariant = NonNullable<
  VariantProps<typeof fieldVariants>['variant']
>;

/**
 * Where an addon sits. The inline pair shares the row with the control; the
 * block pair takes a row of its own and makes the field taller.
 */
export type TFieldAlign =
  | 'inline-start'
  | 'inline-end'
  | 'block-start'
  | 'block-end';

export interface IFieldProps {
  /** How the shell is dressed; the field behaves the same in all of them. */
  variant?: TFieldVariant;
  size?: TSize;
  disabled?: boolean;
  /** Caption: sits in the field, moves onto the leader once the field is used. */
  label?: string;
  /** Marks the field required and turns the marker red. */
  required?: boolean;
  /** Text colour and focused line colour. */
  accent?: string;
  /** Lets the box grow past one row and blunts the tips into corners. */
  multiline?: boolean;
  /**
   * Says the control holds a value. Text controls report that themselves
   * through `:placeholder-shown`; a shell built on anything else has to say so.
   */
  filled?: boolean;
}
