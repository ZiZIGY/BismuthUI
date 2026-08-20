/** One choice in a list. A bare string is shorthand for `{ value, label }`. */
export interface IOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export type TOptionSource = IOption | string;

export function toOption(source: TOptionSource): IOption {
  return typeof source === 'string' ? { value: source, label: source } : source;
}
