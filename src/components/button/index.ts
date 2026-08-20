import { cva, type VariantProps } from 'class-variance-authority';
import type { IRippleOptions } from '../../directives/ripple';
import type { TSize, TSpeed } from '../../theme/types';
import type { Component } from 'vue';

/**
 * Variants only swap frame variables, so states are pure style changes with no
 * re-render. Sizes stay out of here: they feed the frame as numbers.
 *
 * The line layer is a solid silhouette sitting under the fill, so a hollow
 * variant cannot simply go transparent — it would expose the line colour. Such
 * variants take the surface colour instead.
 */
export const buttonVariants = cva(
  [
    'b-button relative inline-flex cursor-pointer appearance-none items-center justify-center',
    'border-0 bg-transparent text-center leading-none font-medium whitespace-nowrap no-underline',
    'transition-transform duration-200 select-none',
    'hover:-translate-y-px active:translate-y-0 active:scale-[0.99]',
  ],
  {
    variants: {
      variant: {
        /*
         * The signature plate: a rainbow band running around the contour.
         *
         * The lines either side of the band are their own role in the theme,
         * since no other one is right in both: bone glares on a dark page and
         * the ground disappears on either. What is wanted is a line that is
         * seen on dark and gone on light, and only the theme knows which is
         * which.
         */
        spectrum: [
          '[--frame-band:var(--b-band)]',
          '[--frame-line:var(--b-band-line)]',
          '[--frame-fill:var(--b-fill)]',
          '[--frame-glow:0.5]',
          'text-(--b-text)',
          'hover:[--frame-glow:0.9] hover:[--frame-fill:var(--b-fill-hover)]',
        ],
        /* same plate, but the contour is a single quiet line */
        plain: [
          '[--frame-line:var(--b-line)]',
          '[--frame-fill:var(--b-fill)]',
          'text-(--b-text)',
          'hover:[--frame-line:var(--b-line-strong)]',
          'hover:[--frame-fill:var(--b-fill-hover)]',
        ],
        /*
         * Glass: a thin contour and the page behind it, refracted. Punching the
         * plate out of the silhouette is the frame's own geometry, not
         * something a variant can ask for with a colour.
         */
        outline: [
          '[--frame-line:var(--b-line)]',
          'text-(--b-text)',
          'hover:[--frame-line:var(--b-line-strong)]',
        ],
        /*
         * Nothing until you reach for it: the hover is a wash of the text
         * colour rather than the opaque fill — an opaque one would make it a
         * plain button without a contour.
         */
        ghost: [
          '[--frame-line:transparent]',
          '[--frame-fill:transparent]',
          'text-(--b-text)',
          'hover:[--frame-fill:color-mix(in_oklab,var(--b-text)_9%,transparent)]',
        ],
      },
      block: { true: 'flex w-full' },
      square: { true: 'b-button--square' },
      caps: { true: 'b-button--caps uppercase' },
      disabled: {
        true: 'pointer-events-none cursor-not-allowed opacity-45 saturate-[0.12]',
      },
    },
    defaultVariants: { variant: 'spectrum' },
  }
);

export type TButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;

export interface IButtonProps {
  variant?: TButtonVariant;
  size?: TSize;
  /** Stretch to full width. */
  block?: boolean;
  /** Icon-only button: turns into a rhombus of the same height. */
  square?: boolean;
  /** Cuts the tips flat, so the contour ends with a short vertical edge. */
  blunt?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Uppercase with tracking. */
  caps?: boolean;
  speed?: TSpeed;
  glow?: boolean;
  /** Press wave. Pass an object to configure it, see `IRippleOptions`. */
  ripple?: boolean | IRippleOptions;
  /** Custom ring palette. First and last colour must match. */
  colors?: readonly string[];
  /** Renders as <a> when set. */
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  /** Explicit host tag when neither button nor a fits. */
  as?: keyof HTMLElementTagNameMap | Component;
}
