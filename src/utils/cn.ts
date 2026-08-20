import { cx } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

/**
 * Component classes plus whatever came from outside, with Tailwind conflicts
 * resolved: `px-4 px-8` keeps only the last one.
 */
export function cn(...inputs: Parameters<typeof cx>): string {
  return twMerge(cx(...inputs));
}
