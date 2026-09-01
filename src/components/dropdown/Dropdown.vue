<script setup lang="ts">
  import { ref, useTemplateRef, watch } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import { useDismiss } from './useDismiss';
  import { useListCursor } from './useListCursor';
  import { openList } from '.';
  import type { TSize } from '../../theme/types';

  defineOptions({ name: 'BDropdown', inheritAttrs: false });

  /**
   * A panel hung off a trigger: it walks the rows in it with the arrow keys and
   * dismisses itself. A menu on a button and the panel of a select are the same
   * object, so they are the same component — `flush` is the whole of the
   * difference.
   *
   * Left alone the panel hangs below the trigger with a gap, cut at all four
   * corners. Flush, it climbs to the trigger's side tips and shares its
   * silhouette: square where the two meet, cut only along the bottom. That
   * only reads right under one of our fields, which is why it is asked for.
   *
   * It knows nothing about what it holds and imposes nothing on it: rows, a
   * search field over a scrolling list, a calendar — whoever puts them in the
   * slot lays them out and asks for a `BScrollArea` if there is anything to
   * scroll. All the panel does is dress what it is given.
   */
  const props = withDefaults(
    defineProps<{
      size?: TSize;
      flush?: boolean;
    }>(),
    { size: 'md' }
  );

  const open = defineModel<boolean>('open', { default: false });

  const root = useTemplateRef<HTMLElement>('root');
  const panel = useTemplateRef<HTMLElement>('panel');

  useDismiss(root, open);

  /*
   * The whole panel, not a list inside it: rows are wherever the caller put
   * them, and a row brought into view finds its own scroller if there is one.
   */
  const cursor = useListCursor(panel, open);

  /*
   * Making way for another list is the one exit that is not played out. It is
   * the one case where it could not be seen anyway — see the stacking in the
   * styles — so the panel is dropped where it stands rather than animated into
   * the field that has just taken over.
   */
  const yielding = ref(false);

  watch(open, (isOpen) => {
    if (!isOpen) return;

    yielding.value = false;
    openList.value = root.value;
  });

  watch(openList, (current) => {
    if (!current || current === root.value) return;
    /* a list of our own, opened inside the panel: it displaces nothing */
    if (root.value?.contains(current)) return;
    /* nor is there anything to make way with once the panel has gone */
    if (!root.value?.querySelector('.b-dropdown__panel')) return;

    yielding.value = true;
    open.value = false;
  });

  const TYPING = 'input:not([readonly]), textarea';

  function openFromTyping(event: Event) {
    if (!(event.target as HTMLElement | null)?.closest(TYPING)) return;

    cursor.reset();
    open.value = true;
  }

  /*
   * Focus opens the list wherever focus is the whole of the gesture: a control
   * that takes typing, and — flush, where the trigger is one of our fields — an
   * arrival by keyboard. A pointer is left to the click instead, which would
   * otherwise shut again what the focus had just opened. Which of the two
   * happened is not guessed at: `:focus-visible` is the browser's own reading
   * of it, and it is settled by the time the focus is heard.
   */
  function openFromFocus(event: FocusEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const byKeyboard = props.flush && target.matches(':focus-visible');
    if (target.closest(TYPING) || byKeyboard) open.value = true;
  }

  /*
   * The control the trigger is typed into, if it is typed into at all. A search
   * box standing in the panel is not what the field is driven by, so it does
   * not count.
   */
  function typedControl() {
    const control = root.value?.querySelector(TYPING);
    return control && !control.closest('.b-dropdown__panel') ? control : null;
  }

  /**
   * Whether the trigger already held the focus when the gesture began. Read on
   * the press, which is before the browser moves the focus, and that is the
   * whole of its use.
   *
   * A field opens the moment it takes focus, so a click that brings the focus
   * with it must not toggle: it would shut what the same gesture had just
   * opened, which is the two-clicks-to-choose bug. A field that already had the
   * focus gets no second focus event, so there the click is the only thing that
   * can act — and it toggles, the way it does on a select.
   */
  let focusedBeforehand = false;

  function toggleFrom(target: HTMLElement | null) {
    if (target?.closest('.b-dropdown__panel')) return false;
    if (props.flush && target?.closest('button, a')) return false;
    if (typedControl() && !focusedBeforehand) return false;

    open.value = !open.value;
    return true;
  }

  /*
   * The press opens the list, not the release. A field opens the moment it
   * takes focus, and a select that waits for the button to come back up reads
   * as the slower of the two standing next to each other.
   *
   * A mouse only: a finger coming down on a field is as often the start of a
   * scroll as it is a tap, so touch and pen keep to the click. Whichever of the
   * two acted, the other must not act again on the same gesture — and a press
   * that was let go somewhere else never sees its click, so the flag is retired
   * by the next press as well.
   */
  let pressToggled = false;

  function onPointerDown(event: PointerEvent) {
    focusedBeforehand = typedControl() === document.activeElement;
    pressToggled =
      event.pointerType === 'mouse' &&
      toggleFrom(event.target as HTMLElement | null);
  }

  function onClick(event: MouseEvent) {
    if (pressToggled) {
      pressToggled = false;
      return;
    }

    toggleFrom(event.target as HTMLElement | null);
  }

  /**
   * A press anywhere in the panel leaves the focus where it is. Reaching into a
   * menu is still working in the field the menu belongs to, and a field that
   * loses the focus folds its caption away, moves, and leaves what was pressed
   * somewhere else by the time the click lands — the very thing a row guards
   * against for itself.
   *
   * Bare space counts as much as a button does, and that is the part easily
   * missed: space is not focusable, so pressing it drops the focus to nothing
   * at all, and a focus that went nowhere is what tells the panel it has been
   * left — the list shuts because a press landed in its own padding.
   *
   * Everything but what is typed into: a search box in the head has to be able
   * to take the focus. Cancelling the default takes nothing else away — the
   * click still fires, and the keyboard still reaches all of it by tab.
   */
  function holdFocus(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.closest(TYPING)) return;

    event.preventDefault();
  }

  function onKeydown(event: KeyboardEvent) {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];

    if (step) {
      event.preventDefault();
      cursor.step(step);
      return;
    }

    if (event.key === 'Enter' && open.value && cursor.index.value >= 0) {
      event.preventDefault();
      cursor.press();
    }
  }
</script>

<template>
  <div
    ref="root"
    class="b-dropdown"
    :class="[
      `b-dropdown--${size}`,
      {
        'b-dropdown--open': open,
        'b-dropdown--flush': flush,
        'b-dropdown--yield': yielding,
      },
    ]"
    v-bind="$attrs"
    @focusin="openFromFocus"
    @input="openFromTyping"
    @keydown="onKeydown"
    @pointerdown="onPointerDown"
    @click="onClick"
  >
    <slot
      name="trigger"
      :open
    />

    <div class="b-dropdown__viewport">
      <Transition name="b-dropdown">
        <div
          v-if="open"
          ref="panel"
          class="b-dropdown__panel"
          @pointermove="cursor.follow"
          @pointerleave="cursor.reset"
          @pointerdown="holdFocus"
        >
          <BFrame
            blunt
            :band="false"
            :glow="false"
          />

          <slot />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style>
  :where(.b-dropdown) {
    --dropdown-pad-block: 0.5em;
    --dropdown-pad-inline: 0.55em;
    /*
     * The same air as at the top, plus the contour. The top edge of the panel
     * is hidden behind the trigger, so the first row is measured against the
     * field; the bottom edge is drawn, and its line eats into the gap.
     */
    --dropdown-pad-foot: calc(
      var(--dropdown-pad-block) + var(--b-stroke, 1.4px) + 1px
    );
    --dropdown-max-height: 15em;
    --dropdown-reveal: 0.24s;
    /* free-standing: how far below the trigger, and how deep the corners cut */
    --dropdown-gap: 0.4em;
    --dropdown-cut: 1.4em;

    /* `auto` is a keyword, and keywords only interpolate once this allows it */
    interpolate-size: allow-keywords;

    position: relative;
    /* a menu is as wide as what opened it; a field's list spans the field */
    display: inline-block;
  }

  .b-dropdown--flush {
    display: block;
  }

  /*
   * How far a flush panel reaches up behind its trigger: to the trigger's side
   * tips, half a field height above its bottom edge.
   */
  .b-dropdown--xs {
    --dropdown-rise: calc(var(--b-field-height-xs) / 2);
  }

  .b-dropdown--sm {
    --dropdown-rise: calc(var(--b-field-height-sm) / 2);
  }

  .b-dropdown--md {
    --dropdown-rise: calc(var(--b-field-height-md) / 2);
  }

  .b-dropdown--lg {
    --dropdown-rise: calc(var(--b-field-height-lg) / 2);
  }

  .b-dropdown--xl {
    --dropdown-rise: calc(var(--b-field-height-xl) / 2);
  }

  /*
   * A flush panel reaches up behind its trigger, so there the trigger paints on
   * top. A free-standing menu is the other way round — it hangs over whatever
   * is below it, its own trigger included — so the lift is asked for by name
   * rather than given to every dropdown.
   */
  .b-dropdown--flush > :not(.b-dropdown__viewport) {
    position: relative;
    z-index: 1;
  }

  /*
   * The order above is a private matter, so a list with a panel becomes its own
   * stacking context: otherwise the trigger of the next list down the page
   * would compete with this panel on the same scale and win by being later.
   *
   * Keyed on the panel being there rather than on the open flag: the flag is
   * dropped the moment closing starts, while the panel stays for the whole of
   * it, and it would spend it sinking under whatever comes after.
   */
  .b-dropdown:has(.b-dropdown__panel) {
    isolation: isolate;
    z-index: 20;
  }

  /*
   * A panel on its way out cannot be ranked against a panel coming in — see
   * `openList`, which is why they never share the screen. This is the ordering
   * for the moment they overlap regardless: the live list wins.
   */
  .b-dropdown--open:has(.b-dropdown__panel) {
    z-index: 21;
  }

  /*
   * The window carries the position and the clip, and stays whether or not
   * there is anything in it: it has to outlive the panel, since it is the panel
   * that comes and goes and something has to be doing the clipping while it
   * does. It costs an empty box — the rows come with the panel, so nothing is
   * held here between openings.
   *
   * Nothing about the panel changes size on the way in or out: its bevels are a
   * fixed length, so a panel that shrank would have them eat the whole of it
   * and the shape would turn into something else and back.
   */
  .b-dropdown__viewport {
    position: absolute;
    top: calc(100% + var(--dropdown-gap));
    left: 0;
    display: flex;
    flex-direction: column;
    min-width: 100%;
    /*
     * Clipped along the top, which is the edge the panel comes out from — and
     * hides behind, when it is flush. Wide open everywhere else: `overflow`
     * would close all four sides and take the shadow with them.
     */
    clip-path: inset(0 -4em -4em -4em);
    /*
     * The window is a frame around the panel, not a surface: while the panel is
     * still on its way in it stands over the page, and a click meant for what
     * is under it should not stop here. The panel takes its own back.
     */
    pointer-events: none;
  }

  /*
   * The shape is the library's own rather than a box, and nothing of it is
   * drawn here by hand — the frame carries contour, fill and shadow.
   *
   * It arrives from behind the window's top edge, a whole panel height up, and
   * slides into place; going, it goes back the same way. A transform is all it
   * is: the box never resizes, so no row is measured twice and the list is free
   * to change its own height while this plays.
   */
  .b-dropdown__panel {
    --frame-slant: var(--dropdown-cut);
    --frame-line: var(--b-line);
    /* a panel is a sheet, not a control seen edge-on: no thickness to shade */
    --frame-edge: transparent;
    --frame-fill: var(--b-elevated);

    position: relative;
    display: flex;
    flex: none;
    flex-direction: column;
    pointer-events: auto;
    transition: transform var(--dropdown-reveal) cubic-bezier(0.2, 0.7, 0.3, 1);
  }

  .b-dropdown-enter-from,
  .b-dropdown-leave-to {
    transform: translateY(-100%);
  }

  /*
   * Unless another list has taken over, and then there is nothing to play: the
   * panel is already behind the field that replaced it. Vue reads the duration
   * off the element it is holding, so none here means it is let go at once.
   */
  .b-dropdown--yield .b-dropdown__panel {
    transition: none;
  }

  /*
   * Flush: the panel climbs to the trigger's side tips and runs straight down
   * from there, so the two share one silhouette — the field's lower bevels lie
   * on the panel, and the triangles beside them are the panel showing through.
   * Its bevel is the trigger's own, and the rise is padded back out so the rows
   * still start below the field.
   */
  .b-dropdown--flush .b-dropdown__viewport {
    top: calc(100% - var(--dropdown-rise));
    right: 0;
  }

  .b-dropdown--flush .b-dropdown__panel {
    --frame-slant: var(--dropdown-rise);

    padding-top: var(--dropdown-rise);
  }

  /*
   * Flush again: only the lower corners are cut. Held to the middle for the
   * same reason as the frame's own: a collapsing panel passes through heights
   * shorter than its bevel, and an unclamped cut turns the outline inside out. The upper two are
   * the trigger's side tips, where the silhouette is already at its widest and
   * nothing may be taken off.
   *
   * The formula cannot move into a variable: var() inside a custom property
   * resolves on the element that declares it, while each layer needs its own
   * --frame-layer. At 45deg a vertex moves in by layer * sqrt(2) and an edge by
   * layer, so the corner bevel equals slant + layer * 0.4142.
   *
   * Addressed to the panel's own frame only. Rows carry frames of their own,
   * and a descendant selector would hand them this contour as well.
   */
  .b-dropdown--flush .b-dropdown__panel > .b-frame > .b-frame__line,
  .b-dropdown--flush .b-dropdown__panel > .b-frame::after {
    clip-path: polygon(
      var(--frame-layer) var(--frame-layer),
      calc(100% - var(--frame-layer)) var(--frame-layer),
      calc(100% - var(--frame-layer))
        max(calc(100% - var(--frame-slant) - var(--frame-layer) * 0.4142), 50%),
      max(calc(100% - var(--frame-slant) - var(--frame-layer) * 0.4142), 50%)
        calc(100% - var(--frame-layer)),
      min(calc(var(--frame-slant) + var(--frame-layer) * 0.4142), 50%)
        calc(100% - var(--frame-layer)),
      var(--frame-layer)
        max(calc(100% - var(--frame-slant) - var(--frame-layer) * 0.4142), 50%)
    );
  }

  /*
   * The air belongs to whatever was put in the panel, not to the panel itself:
   * a strip of buttons or a calendar is padded where it stands, while a
   * scrolling list pads inside its own box, so its rows travel under the rim
   * and are cut by the contour rather than stopping short of it.
   *
   * The bottom is a shade deeper than the top. The panel's upper edge is hidden
   * behind the trigger, so the first row is measured against the field; the
   * lower edge is drawn, and its line eats into the gap.
   */
  .b-dropdown__panel > :not(.b-frame, .b-scroll-area) {
    position: relative;
    z-index: 1;
    padding-block: var(--dropdown-pad-block) var(--dropdown-pad-foot);
    padding-inline: var(--dropdown-pad-inline);
  }

  .b-dropdown__panel > .b-scroll-area {
    --scroll-area-height: var(--dropdown-max-height);
    --scroll-area-pad-block-start: var(--dropdown-pad-block);
    --scroll-area-pad-block-end: var(--dropdown-pad-foot);
    --scroll-area-pad-inline: var(--dropdown-pad-inline);
  }

  /*
   * A panel with nothing in it is not shown at all, and saying so takes no prop
   * and no state: either nothing was put in it, or the only thing put in it is
   * a list with no rows. A caller who wants a word said about an empty result
   * puts one there, and the panel comes back with it.
   */
  .b-dropdown__viewport:not(
      :has(.b-dropdown__panel > :not(.b-frame, .b-scroll-area))
    ):not(:has(.b-scroll-area__viewport > *)) {
    display: none;
  }

  /*
   * A field standing in the panel is furniture, not a field of its own: the
   * panel is already the frame around it. Contour, marker and the leader that
   * would unfold above it are all taken off, so a search box can be dropped
   * into the head as it comes and still read as a row to type in. Its caption
   * stays, since with the leader gone it is the only hint left, and it clears
   * itself the moment anything is typed.
   */
  .b-dropdown__panel .b-field__leader,
  .b-dropdown__panel .b-field__box::before,
  .b-dropdown__panel .b-field > .b-field__box > .b-frame {
    display: none;
  }

  .b-dropdown__panel .b-field--line .b-field__box {
    border-bottom: 0;
  }

  .b-dropdown__empty {
    color: var(--b-muted);
  }

  /*
   * The bar stops a bevel short of the floor when the list is the last thing in
   * a flush panel: standing at the very edge it has no shape of its own to
   * clear the cut corner with, the way a row does. Anything under the list —
   * a foot — holds it off the corner already.
   */
  .b-dropdown--flush
    .b-dropdown__panel
    > .b-scroll-area:last-child
    .b-scroll-area__bar--vertical {
    bottom: var(--dropdown-rise);
  }

  @media (prefers-reduced-motion: reduce) {
    .b-dropdown__panel {
      transition: none;
    }
  }
</style>
