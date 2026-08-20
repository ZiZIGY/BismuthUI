import type { TOptionSource } from '../option';
import type { TFieldVariant } from '../field';
import type { TSize } from '../../theme/types';

export interface IAutocompleteProps {
  /** Suggestions to complete from. */
  options: readonly TOptionSource[];
  /** How the shell is dressed; see `BField`. */
  variant?: TFieldVariant;
  size?: TSize;
  /** Caption: sits in the field, moves onto the leader once the field is used. */
  label?: string;
  disabled?: boolean;
  required?: boolean;
}
