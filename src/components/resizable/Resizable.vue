<script setup lang="ts">
  import {
    computed,
    ref,
    useAttrs,
    useTemplateRef,
    type CSSProperties,
    type StyleValue,
  } from 'vue';
  import { cn } from '../../utils/cn';
  import { resizableVariants, type IResizableProps } from '.';

  defineOptions({ name: 'BResizable', inheritAttrs: false });

  /**
   * A box the reader can pull to the size they want, with a grip of our own
   * rather than the browser's.
   *
   * `resize: both` would be one line and is not used, for one reason: the grip
   * it draws sits in the bottom-right corner of the padding box, which is
   * exactly where a scroll bar ends. Anything that scrolls inside such a box
   * has its bar and its grip in the same few pixels, and the two fight over
   * every press.
   *
   * Ours hangs outside the box altogether, and the room it needs is margin
   * rather than padding — so the content box is left whole, a `BScrollArea`
   * inside draws its bars against the true edge, and the two never meet. What
   * shows is a mark on the side that can be pulled: a corner for a box that
   * takes both, a rail on the edge for a box that takes one, so the way it
   * grows can be read without dragging it to find out.
   *
   * Whatever is put in is stretched to the box. A scroll area handed no height
   * has nothing to scroll against and simply grows, which is the overflow that
   * used to run out of the bottom.
   *
   * Nothing else is dressed. No plate, no contour, no padding round what goes
   * in: a box holding a scroll area, a map or a picture should look like that
   * thing and not like a component. All it does is give the slot the size the
   * reader chose, and hang a grip off the side that can change it.
   *
   * The size is written to the element rather than held as a prop. It is the
   * reader's, not the caller's — and the limits stay in CSS, where sizes
   * belong. A style handed in from outside is kept and the dragged size laid
   * over it, so `width` is a starting size and `min-width` a floor, both said
   * in the ordinary way.
   */
  const props = withDefaults(defineProps<IResizableProps>(), {
    axis: 'both',
    label: 'Resize',
  });

  /** How far an arrow key moves the edge. */
  const STEP = 16;

  const root = useTemplateRef<HTMLElement>('root');
  const attrs = useAttrs();

  /*
   * Class and style are taken out and put back by hand further down, so that
   * the size this component works out lands on top of whatever style came in
   * rather than instead of it. Everything else — an id, a data attribute, a
   * listener — is passed along untouched.
   */
  const passThrough = computed(() => {
    const rest: Record<string, unknown> = { ...attrs };
    delete rest.class;
    delete rest.style;
    return rest;
  });

  const width = ref<number>();
  const height = ref<number>();

  const across = computed(() => props.axis !== 'vertical');
  const down = computed(() => props.axis !== 'horizontal');

  /*
   * Only what has actually been dragged. An untouched axis is left out rather
   * than written as nothing, so the size the caller set stands until the
   * reader moves it.
   */
  const size = computed<CSSProperties>(() => {
    const style: CSSProperties = {};

    if (width.value !== undefined) style.width = `${width.value}px`;
    if (height.value !== undefined) style.height = `${height.value}px`;

    return style;
  });

  interface IBounds {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  }

  interface IGrab {
    x: number;
    y: number;
    width: number;
    height: number;
    bounds: IBounds;
  }

  let grab: IGrab | null = null;

  const dragging = ref(false);

  /** What a percentage in a limit is a percentage of: the room the box sits in. */
  function roomOf(box: HTMLElement) {
    const parent = box.parentElement;
    if (!parent) return { width: Infinity, height: Infinity };

    const style = getComputedStyle(parent);

    return {
      width:
        parent.clientWidth -
        Number.parseFloat(style.paddingLeft) -
        Number.parseFloat(style.paddingRight),
      height:
        parent.clientHeight -
        Number.parseFloat(style.paddingTop) -
        Number.parseFloat(style.paddingBottom),
    };
  }

  function toPixels(value: string, basis: number, fallback: number) {
    const figure = Number.parseFloat(value);

    /* `none` and `auto` parse to nothing, and both mean "no limit here" */
    if (Number.isNaN(figure)) return fallback;

    return value.endsWith('%') ? (figure / 100) * basis : figure;
  }

  /*
   * The limits as the stylesheet has them. They are read rather than taken as
   * props because that is where sizes belong, and read again at every grab so
   * a limit that moves with the viewport is never stale.
   *
   * Resolved here and not left to the browser: it would clamp the box on its
   * own, but the figure this component is holding would go on past the limit,
   * and the reader would have to drag all the way back before the edge moved
   * again. `getComputedStyle` hands a limit back as it was written, so a
   * percentage arrives as a percentage and has to be worked out.
   */
  function boundsOf(box: HTMLElement): IBounds {
    const style = getComputedStyle(box);
    const room = roomOf(box);

    return {
      minWidth: toPixels(style.minWidth, room.width, 0),
      maxWidth: toPixels(style.maxWidth, room.width, Infinity),
      minHeight: toPixels(style.minHeight, room.height, 0),
      maxHeight: toPixels(style.maxHeight, room.height, Infinity),
    };
  }

  function clamp(value: number, low: number, high: number) {
    return Math.min(Math.max(value, low), high);
  }

  function resize(byWidth: number, byHeight: number) {
    const box = root.value;
    if (!box) return;

    const bounds = boundsOf(box);
    const rect = box.getBoundingClientRect();

    if (across.value) {
      width.value = clamp(
        rect.width + byWidth,
        bounds.minWidth,
        bounds.maxWidth
      );
    }

    if (down.value) {
      height.value = clamp(
        rect.height + byHeight,
        bounds.minHeight,
        bounds.maxHeight
      );
    }
  }

  function onPointerDown(event: PointerEvent) {
    const box = root.value;
    if (!box || props.disabled) return;

    const rect = box.getBoundingClientRect();

    grab = {
      x: event.clientX,
      y: event.clientY,
      width: rect.width,
      height: rect.height,
      bounds: boundsOf(box),
    };

    dragging.value = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent) {
    if (!grab) return;

    if (across.value) {
      width.value = clamp(
        grab.width + event.clientX - grab.x,
        grab.bounds.minWidth,
        grab.bounds.maxWidth
      );
    }

    if (down.value) {
      height.value = clamp(
        grab.height + event.clientY - grab.y,
        grab.bounds.minHeight,
        grab.bounds.maxHeight
      );
    }
  }

  function onPointerUp(event: PointerEvent) {
    grab = null;
    dragging.value = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  function onKeydown(event: KeyboardEvent) {
    if (props.disabled) return;

    let byWidth = 0;
    let byHeight = 0;

    if (event.key === 'ArrowLeft') byWidth = -STEP;
    else if (event.key === 'ArrowRight') byWidth = STEP;
    else if (event.key === 'ArrowUp') byHeight = -STEP;
    else if (event.key === 'ArrowDown') byHeight = STEP;
    else return;

    event.preventDefault();
    resize(byWidth, byHeight);
  }
</script>

<template>
  <div
    ref="root"
    v-bind="passThrough"
    :class="
      cn(
        resizableVariants({ axis, disabled }),
        dragging && 'b-resizable--dragging',
        attrs.class as string
      )
    "
    :style="[attrs.style as StyleValue, size]"
  >
    <slot />

    <button
      v-if="!disabled"
      type="button"
      class="b-resizable__grip"
      :aria-label="label"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
    />
  </div>
</template>

<style>
  /*
   * A grid of one cell, so whatever is put in is stretched to the box on both
   * axes. Without that a child is only as tall as its own content, and a
   * scroll area given no height to work against never scrolls — it grows, and
   * its last rows run out past the bottom edge.
   */
  :where(.b-resizable) {
    --resizable-grip: 16px;
    --resizable-mark: 9px;
    /*
     * How far each of the two strokes stands off the box. Stated as distances
     * from the edge rather than left to fall out of the mark's own size: a
     * corner is drawn on the far side of its square and a rail on the near
     * side of its box, so the same figure written once as a size would put the
     * corner half a mark further out than the rails and read as a wider gap on
     * a box that takes both.
     */
    --resizable-near: 5px;
    --resizable-far: 10px;
    --resizable-line: var(--b-line);
    --resizable-line-strong: var(--b-line-strong);

    display: grid;
    min-width: 0;
    min-height: 0;
  }

  /*
   * The room the grip needs, taken outside the box rather than inside it. As
   * padding it would shrink the content box, and a scroll bar drawn against
   * that edge would land back under the grip — which is the collision the
   * whole component exists to avoid.
   */
  .b-resizable--horizontal,
  .b-resizable--both {
    margin-inline-end: var(--resizable-grip);
  }

  .b-resizable--vertical,
  .b-resizable--both {
    margin-block-end: var(--resizable-grip);
  }

  .b-resizable__grip {
    position: absolute;
    padding: 0;
    background: transparent;
    border: 0;
    /* or a drag on a touch screen scrolls the page instead of pulling the box */
    touch-action: none;
  }

  /*
   * Two strokes rather than one, and of unequal length. A single line reads as
   * a border that happens to be adrift; a pair reads as something meant to be
   * taken hold of, which is the one thing a grip has to say.
   *
   * Placed rather than centred: every offset below is measured from the box's
   * own edge, so a corner and a rail stand off it by exactly the same figure.
   */
  .b-resizable__grip::before,
  .b-resizable__grip::after {
    content: '';
    position: absolute;
    border-color: var(--resizable-line);
    border-style: solid;
    transition: border-color 0.15s ease;
  }

  .b-resizable__grip:hover::before,
  .b-resizable__grip:hover::after,
  .b-resizable__grip:focus-visible::before,
  .b-resizable__grip:focus-visible::after,
  .b-resizable--dragging .b-resizable__grip::before,
  .b-resizable--dragging .b-resizable__grip::after {
    border-color: var(--resizable-line-strong);
  }

  .b-resizable__grip:focus-visible {
    outline: none;
  }

  /*
   * Both ways: two nested corners, each drawn as the pair of edges that meet
   * where the pulling happens. Square rather than turned 45deg, unlike the
   * marks elsewhere — a rhombus points one way, and the whole of what this
   * says is "two ways at once".
   *
   * The arms run back along the outside of the box, in the margin the grip
   * already has, so they can be as long as they like without ever reaching the
   * content.
   */
  .b-resizable--both .b-resizable__grip {
    right: calc(var(--resizable-grip) * -1);
    bottom: calc(var(--resizable-grip) * -1);
    width: var(--resizable-grip);
    height: var(--resizable-grip);
    cursor: nwse-resize;
  }

  .b-resizable--both .b-resizable__grip::before,
  .b-resizable--both .b-resizable__grip::after {
    border-width: 0 var(--b-stroke, 1.4px) var(--b-stroke, 1.4px) 0;
  }

  .b-resizable--both .b-resizable__grip::before {
    right: calc(var(--resizable-grip) - var(--resizable-near));
    bottom: calc(var(--resizable-grip) - var(--resizable-near));
    width: calc(var(--resizable-mark) * 1.3);
    height: calc(var(--resizable-mark) * 1.3);
  }

  .b-resizable--both .b-resizable__grip::after {
    right: calc(var(--resizable-grip) - var(--resizable-far));
    bottom: calc(var(--resizable-grip) - var(--resizable-far));
    width: calc(var(--resizable-mark) * 2.4);
    height: calc(var(--resizable-mark) * 2.4);
  }

  /*
   * One way: rails along the edge that moves. The grip runs the whole side,
   * since an edge is a larger thing to catch than a corner.
   */
  .b-resizable--horizontal .b-resizable__grip {
    top: 0;
    right: calc(var(--resizable-grip) * -1);
    bottom: 0;
    width: var(--resizable-grip);
    cursor: ew-resize;
  }

  .b-resizable--horizontal .b-resizable__grip::before,
  .b-resizable--horizontal .b-resizable__grip::after {
    top: 50%;
    border-width: 0 var(--b-stroke, 1.4px) 0 0;
    transform: translateY(-50%);
  }

  .b-resizable--horizontal .b-resizable__grip::before {
    right: calc(var(--resizable-grip) - var(--resizable-near));
    height: calc(var(--resizable-mark) * 2.4);
  }

  .b-resizable--horizontal .b-resizable__grip::after {
    right: calc(var(--resizable-grip) - var(--resizable-far));
    height: calc(var(--resizable-mark) * 1.3);
  }

  .b-resizable--vertical .b-resizable__grip {
    right: 0;
    bottom: calc(var(--resizable-grip) * -1);
    left: 0;
    height: var(--resizable-grip);
    cursor: ns-resize;
  }

  .b-resizable--vertical .b-resizable__grip::before,
  .b-resizable--vertical .b-resizable__grip::after {
    left: 50%;
    border-width: 0 0 var(--b-stroke, 1.4px);
    transform: translateX(-50%);
  }

  .b-resizable--vertical .b-resizable__grip::before {
    bottom: calc(var(--resizable-grip) - var(--resizable-near));
    width: calc(var(--resizable-mark) * 2.4);
  }

  .b-resizable--vertical .b-resizable__grip::after {
    bottom: calc(var(--resizable-grip) - var(--resizable-far));
    width: calc(var(--resizable-mark) * 1.3);
  }
</style>
