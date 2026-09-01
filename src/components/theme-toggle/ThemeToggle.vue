<script setup lang="ts">
  import { computed } from 'vue';
  import { useColorMode } from '@vueuse/core';
  import BButton from '../button/Button.vue';
  import type { TSize } from '../../theme/types';

  defineOptions({ name: 'BThemeToggle', inheritAttrs: false });

  /**
   * Theme switch. The mode is stored by VueUse and written into `data-theme`
   * on the root, which is exactly what the token blocks in `style.css` listen
   * to; `auto` leaves the choice to the system.
   */
  withDefaults(defineProps<{ size?: TSize }>(), { size: 'md' });

  const mode = useColorMode({
    attribute: 'data-theme',
    modes: { light: 'light', dark: 'dark' },
  });

  const isDark = computed(() => mode.value === 'dark');

  /*
   * Plain shapes on purpose: an animated icon only shows a frozen frame while
   * the view transition is running, since the page is showing snapshots then.
   *
   * Drawn here rather than pulled from an icon set. Two glyphs are not worth a
   * dependency, and a static import of one is a hard requirement on everybody
   * who installs the library — including the majority who never render this
   * component.
   */

  /** Rhombus that covers the viewport from (x, y): half-diagonal r. */
  function rhombus(x: number, y: number, reach: number) {
    return (
      `polygon(${x}px ${y - reach}px, ${x + reach}px ${y}px, ` +
      `${x}px ${y + reach}px, ${x - reach}px ${y}px)`
    );
  }

  async function toggle(event: MouseEvent) {
    const next = isDark.value ? 'light' : 'dark';
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!document.startViewTransition || reducedMotion) {
      mode.value = next;
      return;
    }

    /*
     * The origin comes from the button itself, and the extent from the layout
     * viewport: pointer coordinates and innerWidth follow the visual viewport,
     * so under pinch zoom they disagree with the snapshot the transition draws.
     */
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const { clientWidth: width, clientHeight: height } =
      document.documentElement;

    // a rhombus covers a point once its half-diagonal reaches |dx| + |dy|
    const reach = Math.max(
      x + y,
      width - x + y,
      x + height - y,
      width - x + height - y
    );

    const transition = document.startViewTransition(() => {
      mode.value = next;
    });

    await transition.ready;

    document.documentElement.animate(
      { clipPath: [rhombus(x, y, 0), rhombus(x, y, reach)] },
      {
        duration: 520,
        easing: 'cubic-bezier(0.3, 0.7, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  }
</script>

<template>
  <div
    class="b-theme-toggle"
    v-bind="$attrs"
  >
    <div class="b-theme-toggle__leader">
      <span
        class="b-theme-toggle__caption"
        aria-hidden="true"
      >
        {{ isDark ? 'dark' : 'light' }}
      </span>
    </div>

    <BButton
      square
      variant="plain"
      :size
      :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
      :ripple="{ center: true }"
      @click="toggle"
    >
      <svg
        class="size-[1.1em]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          v-if="isDark"
          d="M20.4 14.9A9 9 0 1 1 9.1 3.6a7 7 0 0 0 11.3 11.3Z"
        />
        <template v-else>
          <circle
            cx="12"
            cy="12"
            r="4"
          />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20
              12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        </template>
      </svg>
    </BButton>
  </div>
</template>

<style>
  /* the new theme is revealed by the rhombus above, not by a cross-fade */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  ::view-transition-old(root) {
    z-index: 0;
  }

  ::view-transition-new(root) {
    z-index: 1;
  }

  /*
   * Dressed like the field: a marker at the tip, a diagonal along the bevel and
   * a shelf carrying the caption. Here the caption names the current mode, so
   * the decoration also reads the state out.
   */
  :where(.b-theme-toggle) {
    --toggle-line: var(--b-line-strong);
    --toggle-stroke: 1.2px;
    --toggle-marker: 7px;
    --toggle-drop: 13px;
    --toggle-caption: 12px;

    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .b-theme-toggle:hover {
    --toggle-line: var(--b-text);
  }

  .b-theme-toggle__leader {
    position: relative;
    display: flex;
    height: calc(var(--toggle-caption) + var(--toggle-drop));
    padding-left: var(--toggle-drop);
  }

  .b-theme-toggle__leader::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: var(--toggle-marker);
    height: var(--toggle-marker);
    background: var(--toggle-line);
    transform: translate(-50%, 50%) rotate(45deg);
    transition: border-color 0.2s ease;
  }

  /* the shelf is drawn by the caption itself, the diagonal by its pseudo */
  .b-theme-toggle__caption {
    position: relative;
    height: var(--toggle-caption);
    padding-inline: 5px 14px;
    font-size: calc(var(--toggle-caption) - 2px);
    line-height: var(--toggle-caption);
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--toggle-line);
    white-space: nowrap;
    border-bottom: var(--toggle-stroke) solid var(--toggle-line);
    transition: color 0.2s ease;
  }

  /* runs down-left from the shelf into the marker, at the same 45deg */
  .b-theme-toggle__caption::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: calc(var(--toggle-stroke) / -2);
    width: calc(var(--toggle-drop) * 1.4142);
    height: var(--toggle-stroke);
    background: var(--toggle-line);
    transform-origin: left center;
    transform: rotate(135deg);
  }
</style>
