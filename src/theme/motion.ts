/**
 * The library's motion, named so every component moves with one character.
 *
 * Springs rather than curves: a spring carries its own sense of weight, and it
 * can be caught mid-flight and sent back without the jump a timed curve makes.
 * The numbers are the vocabulary — change them here and the whole library
 * changes its manner, the way the palette works in `style.css`.
 */
export const SPRING = {
  type: 'spring',
  stiffness: 520,
  damping: 44,
} as const;

/** Slower and looser, for anything that travels a long way. */
export const SPRING_SOFT = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
} as const;
