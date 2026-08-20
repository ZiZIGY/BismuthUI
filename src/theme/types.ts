/** Single size scale shared by every component. */
export type TSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Spectrum travel speed. The seconds behind each name live in the theme as
 * `--b-speed-*`, so a page can retime the ring without rebuilding anything.
 * `none` keeps it still.
 */
export type TSpeed = 'none' | 'slow' | 'normal' | 'fast';
