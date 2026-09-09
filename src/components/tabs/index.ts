import { cva } from 'class-variance-authority';
import type { InjectionKey, Ref, ShallowRef } from 'vue';
import type { TSize } from '../../theme/types';

/** Which way the strip runs, and therefore which way a panel arrives from. */
export type TTabsOrientation = 'horizontal' | 'vertical';

/**
 * One tab, as the root knows it. The element is kept rather than a `disabled`
 * flag: it is a real `<button>`, so the DOM already holds that answer and
 * holding a second copy only invites the two to disagree.
 */
export interface ITabsItem {
  value: string | number;
  el: HTMLButtonElement;
}

export interface ITabsContext {
  /** Prefix for the ids that tie a tab to its panel. */
  name: string;
  active: Readonly<Ref<string | number | undefined>>;
  orientation: Readonly<Ref<TTabsOrientation>>;
  /** In mount order, which for a list of tabs is document order. */
  items: Readonly<ShallowRef<readonly ITabsItem[]>>;
  select: (value: string | number) => void;
  register: (item: ITabsItem) => void;
  release: (item: ITabsItem) => void;
}

export const TABS_CONTEXT: InjectionKey<ITabsContext> = Symbol('b-tabs');

/**
 * The root lays the two parts out, and which way round is the whole of the
 * orientation: a strip above its panels, or a strip beside them.
 *
 * Nothing says `align-items` — the flex default stretches, which is what makes
 * the strip and the panels agree on the cross axis without either being told
 * the other's size.
 */
export const tabsVariants = cva('b-tabs flex', {
  variants: {
    orientation: {
      horizontal: 'b-tabs--horizontal flex-col',
      vertical: 'b-tabs--vertical flex-row',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export interface ITabsProps {
  size?: TSize;
  orientation?: TTabsOrientation;
}

export interface ITabProps {
  value: string | number;
  disabled?: boolean;
}

export interface ITabPanelProps {
  value: string | number;
}
