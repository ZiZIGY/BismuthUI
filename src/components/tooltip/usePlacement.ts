import {
  useElementBounding,
  useElementSize,
  useRafFn,
  useWindowSize,
} from '@vueuse/core';
import { computed, watch, type Ref } from 'vue';
import type { TTooltipPlacement, TTooltipSide } from '.';

const SIDES: readonly TTooltipSide[] = ['top', 'bottom', 'left', 'right'];

const OPPOSITE: Record<TTooltipSide, TTooltipSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function clamp(value: number, low: number, high: number) {
  return Math.min(Math.max(value, low), Math.max(low, high));
}

/**
 * Where the floating box lands, worked out from the trigger and the box's own
 * measured size rather than asked for in pixels — a tooltip has no way of
 * knowing how wide its own content will turn out to be ahead of the browser
 * laying it out.
 *
 * `auto` orders every side by whichever has the most room to begin with and
 * takes the first. A named side is tried first regardless, its opposite
 * second, and the remaining two last — so `placement="right"` run out of room
 * on the right goes left, and only falls back further than that in a viewport
 * too small for either.
 *
 * A side "fits" along its own axis and is otherwise clamped across it: the box
 * is centred on the trigger and then held inside the viewport rather than let
 * run off the edge it wasn't even testing against.
 *
 * The trigger is read when the box opens and then every frame until it
 * closes. The bounding's own observers only notice the trigger resizing or
 * the page scrolling — a trigger pushed along by a neighbour appearing or
 * leaving keeps its size, nothing scrolls, and the box would open where the
 * trigger used to be. Hence no listeners of its own either: a closed tooltip
 * has nothing to keep up to date, and an open one is polled anyway.
 *
 * The box itself is sized rather than bounded. Its rect carries the entry
 * transform — shrunk and nudged while closed — so centring on it lands a few
 * pixels off; the border box is the size it settles at.
 */
export function usePlacement(
  trigger: Ref<HTMLElement | null>,
  panel: Ref<HTMLElement | null>,
  placement: Ref<TTooltipPlacement>,
  open: Ref<boolean>,
  gap = 8,
  edge = 8
) {
  const from = useElementBounding(trigger, {
    windowResize: false,
    windowScroll: false,
  });
  const box = useElementSize(panel, undefined, { box: 'border-box' });
  const viewport = useWindowSize({ includeScrollbar: false });

  const { pause, resume } = useRafFn(from.update, { immediate: false });

  watch(open, (value) => {
    if (value) {
      from.update();
      resume();
    } else {
      pause();
    }
  });

  const side = computed<TTooltipSide>(() => {
    const room = {
      top: from.top.value,
      bottom: viewport.height.value - from.bottom.value,
      left: from.left.value,
      right: viewport.width.value - from.right.value,
    };

    const byRoom = [...SIDES].sort((a, b) => room[b] - room[a]);

    const preferred = placement.value;
    const order =
      preferred === 'auto'
        ? byRoom
        : [
            preferred,
            OPPOSITE[preferred],
            ...SIDES.filter(
              (candidate) =>
                candidate !== preferred && candidate !== OPPOSITE[preferred]
            ),
          ];

    const fits = (candidate: TTooltipSide) => {
      const along =
        candidate === 'top' || candidate === 'bottom'
          ? box.height.value
          : box.width.value;
      return room[candidate] >= along + gap;
    };

    return order.find(fits) ?? byRoom[0];
  });

  const style = computed(() => {
    const current = side.value;
    let top: number;
    let left: number;

    if (current === 'top' || current === 'bottom') {
      top =
        current === 'top'
          ? from.top.value - box.height.value - gap
          : from.bottom.value + gap;

      const centre = from.left.value + from.width.value / 2 - box.width.value / 2;
      left = clamp(centre, edge, viewport.width.value - box.width.value - edge);
    } else {
      left =
        current === 'left'
          ? from.left.value - box.width.value - gap
          : from.right.value + gap;

      const centre =
        from.top.value + from.height.value / 2 - box.height.value / 2;
      top = clamp(centre, edge, viewport.height.value - box.height.value - edge);
    }

    return { top: `${top}px`, left: `${left}px` };
  });

  return { side, style };
}
