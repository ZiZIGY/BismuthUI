import type { TOptionSource } from '../option';
import type { TFieldVariant } from '../field';
import type { TSize } from '../../theme/types';

/** A single choice, or several of them when `multiple` is on. */
export type TSelectValue = string | number | readonly (string | number)[];

export interface ISelectProps {
  options: readonly TOptionSource[];
  /** How the shell is dressed; see `BField`. */
  variant?: TFieldVariant;
  /** Keeps the list open and collects the picks into an array. */
  multiple?: boolean;
  size?: TSize;
  /** Caption: sits in the field, moves onto the leader once a choice is made. */
  label?: string;
  disabled?: boolean;
}
