import type { Directive } from 'vue';

/**
 * Rhombus-shaped press wave.
 *
 * Timings follow v-wave so the feel is familiar: the rhombus grows for 0.4s
 * with ease-out, fading from 0.2 to 0.1 on the way, waits for the release and
 * dissolves in 0.15s. The layer is marked with `.b-ripple` so a component can
 * clip it to its own contour and the wave never leaks past the bevels.
 */
export interface IRippleOptions {
  /** Wave colour. */
  color?: string;
  /** Opacity at press. */
  initialOpacity?: number;
  /** Opacity once fully grown. */
  finalOpacity?: number;
  /** Grow duration, seconds. */
  duration?: number;
  /** Dissolve duration after release, seconds. */
  dissolveDuration?: number;
  /** Always start from the centre instead of the pointer. */
  center?: boolean;
}

/** `false` disables the wave, an object configures it. */
export type TRippleValue = IRippleOptions | boolean | undefined;

const DEFAULT_OPTIONS: Required<IRippleOptions> = {
  color: 'var(--ripple-color, currentColor)',
  initialOpacity: 0.2,
  finalOpacity: 0.1,
  duration: 0.4,
  dissolveDuration: 0.15,
  center: false,
};

const EASING = 'ease-out';

/** While it lasts, a cancelled gesture (scroll, swipe) removes the wave outright. */
const CANCELLATION_PERIOD = 75;

/** Small allowance for rounding so the far corner is never left bare. */
const SIZE_ALLOWANCE = 1.025;

interface IRippleState {
  enabled: boolean;
  options: Required<IRippleOptions>;
  layer: HTMLElement;
  onPointerDown: (event: PointerEvent) => void;
  onClick: (event: MouseEvent) => void;
}

const states = new WeakMap<HTMLElement, IRippleState>();

function readValue(value: TRippleValue) {
  return {
    enabled: value !== false,
    options: {
      ...DEFAULT_OPTIONS,
      ...(typeof value === 'object' ? value : null),
    },
  };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function createLayer(host: HTMLElement): HTMLElement {
  if (getComputedStyle(host).position === 'static') {
    host.style.position = 'relative';
  }

  /*
   * The layer gets a box and nothing that decides its shape: whatever holds
   * the wave says where it ends, through a `clip-path` in that component's own
   * stylesheet. An inline clip here could not be overridden.
   *
   * `overflow: clip` is a different matter, and it has to be here. A wave is a
   * square wide enough to reach the furthest corner from wherever it was
   * struck, so it hangs far outside the layer — invisible, since the clip-path
   * shapes it, but a clip-path only shapes the painting. The wave still counts
   * towards the scrollable overflow of every scroll container it sits in, and
   * any list holding a rippled control was growing a screen of emptiness for
   * as long as a wave lived. `clip` takes it out of that reckoning, and unlike
   * `hidden` it makes no scroll container of its own.
   *
   * Nothing is lost to it: the clip box is the layer's own rectangle, and
   * every contour a component gives it is cut from percentages of that same
   * rectangle — so the two never disagree.
   */
  const layer = document.createElement('span');
  layer.className = 'b-ripple';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText =
    'position:absolute;inset:0;overflow:clip;pointer-events:none';

  host.appendChild(layer);
  return layer;
}

/**
 * A rhombus covers a point once its half-diagonal reaches the Manhattan
 * distance to that point, so the size is derived from it.
 */
function reachToFurthestCorner(
  width: number,
  height: number,
  x: number,
  y: number
): number {
  return Math.max(x + y, width - x + y, x + height - y, width - x + height - y);
}

/**
 * Starts a wave at (x, y) of the layer and returns the finisher: it fades the
 * wave out, or removes it at once when the gesture was cancelled.
 */
function spawn(state: IRippleState, x: number, y: number) {
  const { color, initialOpacity, finalOpacity, duration, dissolveDuration } =
    state.options;
  const { width, height } = state.layer.getBoundingClientRect();

  // side of the square whose half-diagonal matches after a 45deg turn
  const side =
    reachToFurthestCorner(width, height, x, y) * Math.SQRT2 * SIZE_ALLOWANCE;

  const wave = document.createElement('span');
  wave.style.cssText =
    `position:absolute;left:${x}px;top:${y}px;` +
    `width:${side}px;height:${side}px;background:${color};` +
    'will-change:transform,opacity';
  state.layer.appendChild(wave);

  const grow = wave.animate(
    [
      {
        transform: 'translate(-50%, -50%) rotate(45deg) scale(0)',
        opacity: initialOpacity,
      },
      {
        transform: 'translate(-50%, -50%) rotate(45deg) scale(1)',
        opacity: finalOpacity,
      },
    ],
    { duration: duration * 1000, easing: EASING, fill: 'forwards' }
  );

  const bornAt = performance.now();

  return async (cancelled: boolean) => {
    if (cancelled && performance.now() - bornAt < CANCELLATION_PERIOD) {
      grow.cancel();
      wave.remove();
      return;
    }

    // released before the wave finished growing — let it finish first
    await grow.finished.catch(() => {});

    const dissolve = wave.animate([{ opacity: finalOpacity }, { opacity: 0 }], {
      duration: dissolveDuration * 1000,
      easing: 'linear',
      fill: 'forwards',
    });
    await dissolve.finished.catch(() => {});
    wave.remove();
  };
}

export const vRipple: Directive<HTMLElement, TRippleValue> = {
  mounted(host, binding) {
    const state: IRippleState = {
      ...readValue(binding.value),
      layer: createLayer(host),
      onPointerDown: () => {},
      onClick: () => {},
    };

    state.onPointerDown = (event) => {
      if (!state.enabled || event.button !== 0 || prefersReducedMotion())
        return;

      const rect = state.layer.getBoundingClientRect();
      const release = state.options.center
        ? spawn(state, rect.width / 2, rect.height / 2)
        : spawn(state, event.clientX - rect.left, event.clientY - rect.top);

      // the pointer may be released outside the element, so listen on window
      const finish = (finishEvent: Event) => {
        window.removeEventListener('pointerup', finish);
        window.removeEventListener('pointercancel', finish);
        release(finishEvent.type === 'pointercancel');
      };

      window.addEventListener('pointerup', finish);
      window.addEventListener('pointercancel', finish);
    };

    state.onClick = (event) => {
      // real clicks carry detail >= 1 and were handled on pointerdown;
      // only keyboard and programmatic clicks reach here, so aim at the centre
      if (!state.enabled || event.detail !== 0 || prefersReducedMotion())
        return;

      const { width, height } = state.layer.getBoundingClientRect();
      spawn(state, width / 2, height / 2)(false);
    };

    host.addEventListener('pointerdown', state.onPointerDown);
    host.addEventListener('click', state.onClick);
    states.set(host, state);
  },

  updated(host, binding) {
    const state = states.get(host);
    if (state) Object.assign(state, readValue(binding.value));
  },

  unmounted(host) {
    const state = states.get(host);
    if (!state) return;

    host.removeEventListener('pointerdown', state.onPointerDown);
    host.removeEventListener('click', state.onClick);
    state.layer.remove();
    states.delete(host);
  },
};
