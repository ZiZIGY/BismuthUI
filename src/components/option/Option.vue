<script setup lang="ts">
  import { motion } from 'motion-v';
  import BFrame from '../frame/Frame.vue';
  import { vRipple } from '../../directives/ripple';
  import { SPRING_SOFT } from '../../theme/motion';

  defineOptions({ name: 'BOption', inheritAttrs: false });

  /**
   * One row of a list: a ghost plate with a press wave. It carries no
   * layout of its own — whatever list holds it decides where it sits — so the
   * field list and the select can share it unchanged.
   *
   * Pressing a row never takes the focus. The trigger it belongs to would lose
   * it, and a field that stops being focused folds its caption away, moves, and
   * leaves the row somewhere else by the time the click lands. Cancelling the
   * default on mousedown keeps the focus where it was; the click still fires,
   * and the press wave rides on pointerdown, which is untouched.
   *
   * A row brings itself in as it comes into view, and that is the whole of it.
   * It cannot be orchestrated — rows arrive through a slot, and a slot belongs
   * to whoever wrote it, so the panel it lands in is not on its lookup path —
   * and it is not seen out either: holding a row past its removal takes a
   * presence or a transition group, and both cost the list more than the going
   * is worth. The gap is closed by the panel, in one height and one transition.
   */
  defineProps<{ selected?: boolean; disabled?: boolean }>();
</script>

<template>
  <motion.button
    type="button"
    class="b-option"
    :class="{ 'b-option--selected': selected }"
    :disabled
    :aria-selected="selected"
    tabindex="-1"
    :initial="{ opacity: 0, y: -16, scale: 0.97 }"
    :while-in-view="{ opacity: 1, y: 0, scale: 1 }"
    :in-view-options="{ once: true, amount: 0.4 }"
    :transition="SPRING_SOFT"
    v-ripple="!disabled"
    v-bind="$attrs"
    @mousedown.prevent
  >
    <span
      class="b-option__mark"
      aria-hidden="true"
    >
      <span
        v-if="selected"
        class="b-option__ring"
      >
        <BFrame rhombus />
      </span>
    </span>

    <slot />
  </motion.button>
</template>

<style>
  /*
   * Nothing of its own until reached for, like the ghost button: the plate the
   * row sits on belongs to the panel, and a contour per row would only draw the
   * same box over and over.
   */
  :where(.b-option) {
    --option-height: 2.5em;
    --option-slant: calc(var(--option-height) / 2);
    --option-pad: 0.7em;
    --option-marker: 1.15em;
    --option-gap: 0.6em;

    position: relative;
    display: flex;
    align-items: center;
    gap: var(--option-gap);
    /* stated, not inherited from the list: a row fills whatever holds it */
    width: 100%;
    height: var(--option-height);
    padding-inline: calc(var(--option-slant) + var(--option-pad));
    color: var(--b-text);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    transition: background 0.15s ease;
    /*
     * The button's own outline: a hexagon whose bevel is half the height, so
     * the sides run at 45deg. Nothing is painted until the row is reached for,
     * and then the wash — and the press wave with it — takes this shape.
     */
    clip-path: polygon(
      0 50%,
      var(--option-slant) 0,
      calc(100% - var(--option-slant)) 0,
      100% 50%,
      calc(100% - var(--option-slant)) 100%,
      var(--option-slant) 100%
    );
  }

  /*
   * Chosen and pointed at are different things, so they are said differently: a
   * tint of the role for the first, the neutral wash for the second. The cursor
   * is declared last on purpose — a row can be both, and what Enter would do
   * matters more than what was picked before.
   *
   * One cursor, not two: `data-active` is set by the list as it walks, and the
   * pointer moves that same cursor. A `:hover` rule here would light a second
   * row whenever the mouse rested somewhere the arrows had not reached.
   */
  .b-option--selected {
    --option-accent: var(--b-tone, var(--b-text));

    color: var(--option-accent);
    background: color-mix(in oklab, var(--option-accent) 12%, transparent);
  }

  .b-option[data-active] {
    background: color-mix(in oklab, var(--b-text) 9%, transparent);
    outline: none;
  }

  .b-option:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  /*
   * Not a gradient dressed up as the ring, but the ring itself: the same frame
   * the spectrum button wears, rhombus this time and small enough to read as a
   * marker. Stroke and band are thinned to suit the size; the spin, the palette,
   * its speed and the shadow come with the component.
   *
   * The cell is collapsed to nothing when there is no ring, and its share of
   * the row's gap is taken back with it, so an unchosen row is laid out exactly
   * as if it were not there. Choosing widens it, and the text moves over
   * instead of jumping.
   */
  .b-option__mark {
    --frame-stroke: 1px;
    --frame-band: 1px;
    --frame-line: var(--b-band-line);
    --frame-fill: var(--b-elevated);
    position: relative;
    flex: none;
    width: 0;
    height: var(--option-marker);
    margin-inline-end: calc(var(--option-gap) * -1);
    transition:
      width 0.22s cubic-bezier(0.2, 0.8, 0.3, 1),
      margin 0.22s cubic-bezier(0.2, 0.8, 0.3, 1);
  }

  .b-option--selected .b-option__mark {
    width: var(--option-marker);
    margin-inline-end: 0;
  }

  /*
   * It waits out the widening, then grows into the room made for it. Its own
   * size is kept while the cell is still narrow — stretched across it, the ring
   * would be squeezed flat and read as a sliver. `@starting-style` is what it
   * grows from, since it is here only for the row that is chosen.
   */
  .b-option__ring {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--option-marker);
    height: 100%;
    transition:
      opacity 0.18s ease 0.18s,
      transform 0.24s cubic-bezier(0.2, 0.8, 0.3, 1) 0.18s;
  }

  @starting-style {
    .b-option__ring {
      opacity: 0;
      transform: scale(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-option__mark,
    .b-option__ring {
      animation: none;
      transition: none;
    }
  }
</style>
