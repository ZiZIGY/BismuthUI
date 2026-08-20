<script setup lang="ts">
  import { computed, ref, useTemplateRef } from 'vue';
  import { useScroll } from '@vueuse/core';
  import BScrollbar from './Scrollbar.vue';
  import type { IScrollAreaProps } from '.';

  defineOptions({ name: 'BScrollArea', inheritAttrs: false });

  /**
   * A box that scrolls, with our bars in place of the native ones. Asked for by
   * whoever needs it: a panel holding three rows or a calendar has nothing to
   * scroll, and the thing around the content should not be deciding otherwise.
   *
   * Both ways if asked, and then each bar keeps out of the other's corner. A
   * bar is only put up while there is something to scroll, so `both` on a box
   * that only ever overflows downwards costs a hidden element and nothing else.
   *
   * How tall or wide it may get and how much air it keeps are read from where
   * it stands — a list in a dropdown is dressed by the dropdown.
   */
  const props = withDefaults(defineProps<IScrollAreaProps>(), {
    axis: 'vertical',
    visibility: 'auto',
  });

  const viewport = useTemplateRef<HTMLElement>('viewport');

  const scrollsDown = ref(false);
  const scrollsAcross = ref(false);

  const down = computed(() => props.axis !== 'horizontal');
  const across = computed(() => props.axis !== 'vertical');

  /*
   * `hover` has to answer to a scroll as well, or a touch would never see a
   * bar: there is no pointer to rest on the box, and the wheel is not the only
   * way content moves.
   */
  const { isScrolling } = useScroll(viewport);

  /*
   * The gutter is not the same question as the bar being visible: held on
   * screen with nothing to scroll, a bar still needs the room, or it would
   * stand on the content.
   */
  const gutterDown = computed(() =>
    props.visibility === 'always' ? down.value : scrollsDown.value
  );

  const gutterAcross = computed(() =>
    props.visibility === 'always' ? across.value : scrollsAcross.value
  );
</script>

<template>
  <div
    class="b-scroll-area"
    :class="[
      `b-scroll-area--${axis}`,
      `b-scroll-area--visibility-${visibility}`,
      {
        'b-scroll-area--scrolls-down': gutterDown,
        'b-scroll-area--scrolls-across': gutterAcross,
        'b-scroll-area--scrolling': isScrolling,
      },
    ]"
  >
    <div
      ref="viewport"
      class="b-scroll-area__viewport"
      tabindex="-1"
      v-bind="$attrs"
    >
      <slot />
    </div>

    <BScrollbar
      v-if="down"
      v-model:overflowing="scrollsDown"
      class="b-scroll-area__bar b-scroll-area__bar--vertical"
      :target="viewport"
    />

    <BScrollbar
      v-if="across"
      v-model:overflowing="scrollsAcross"
      class="b-scroll-area__bar b-scroll-area__bar--horizontal"
      axis="horizontal"
      :target="viewport"
    />
  </div>
</template>

<style>
  /*
   * The dressing arrives as variables rather than as rules from outside, so the
   * gutter arithmetic stays here: a bar has to be added to whatever padding the
   * box was handed, and the bars have to be told where the content edge is.
   */
  :where(.b-scroll-area) {
    --scroll-area-gutter: 1.6em;

    position: relative;
    display: flex;
    min-height: 0;
  }

  /*
   * A flex column, because a button sizes itself to its text even as a block
   * box; as a flex item it stretches instead. Shrinking is off, or the content
   * would squash rather than scroll.
   */
  .b-scroll-area__viewport {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    max-width: var(--scroll-area-width, none);
    max-height: var(--scroll-area-height, none);
    padding-block: var(--scroll-area-pad-block-start, 0px)
      var(--scroll-area-pad-block-end, 0px);
    padding-inline: var(--scroll-area-pad-inline, 0px);
    /*
     * Arrowing to a row off screen brings it to the nearest edge, which means
     * flush against it. The same air the ends keep is reserved here too, so a
     * row scrolled into view lands where a row belongs.
     */
    scroll-padding-block: var(--scroll-area-pad-block-start, 0px)
      var(--scroll-area-pad-block-end, 0px);
    scroll-padding-inline: var(--scroll-area-pad-inline, 0px);
    scroll-behavior: smooth;
    /* the native bars are replaced by our own, drawn in the gutters */
    scrollbar-width: none;
  }

  .b-scroll-area__viewport::-webkit-scrollbar {
    display: none;
  }

  .b-scroll-area__viewport > * {
    flex: none;
  }

  /*
   * The axis that was not asked for is closed rather than left alone: an axis
   * set to `visible` beside one that scrolls computes to `auto` on its own, so
   * a box asked for one direction would quietly travel in both, and without a
   * bar in the one nobody asked about.
   */
  .b-scroll-area--vertical .b-scroll-area__viewport {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .b-scroll-area--horizontal .b-scroll-area__viewport {
    overflow-x: auto;
    overflow-y: hidden;
  }

  .b-scroll-area--both .b-scroll-area__viewport {
    overflow: auto;
  }

  /*
   * Across, a stretched item would be held to the width of the box and there
   * would be nothing to scroll. Left to its own width it overflows, which is
   * the whole point of asking for the axis.
   */
  .b-scroll-area--horizontal .b-scroll-area__viewport,
  .b-scroll-area--both .b-scroll-area__viewport {
    align-items: flex-start;
  }

  /* content keeps clear of a bar, but only while there is one */
  .b-scroll-area--scrolls-down .b-scroll-area__viewport {
    padding-right: calc(
      var(--scroll-area-pad-inline, 0px) + var(--scroll-area-gutter)
    );
  }

  .b-scroll-area--scrolls-across .b-scroll-area__viewport {
    padding-bottom: calc(
      var(--scroll-area-pad-block-end, 0px) + var(--scroll-area-gutter)
    );
  }

  /*
   * The bars stand on the content edge, not on the box edge: the padding is the
   * air the content keeps, and a bar reaching past it would sit on the rim of
   * whatever the box is set into.
   */
  .b-scroll-area__bar {
    position: absolute;
    z-index: 2;
  }

  .b-scroll-area__bar--vertical {
    top: var(--scroll-area-pad-block-start, 0px);
    right: var(--scroll-area-pad-inline, 0px);
    bottom: var(--scroll-area-pad-block-end, 0px);
  }

  .b-scroll-area__bar--horizontal {
    right: var(--scroll-area-pad-inline, 0px);
    bottom: var(--scroll-area-pad-block-end, 0px);
    left: var(--scroll-area-pad-inline, 0px);
  }

  /* neither bar runs into the corner the other one needs */
  .b-scroll-area--scrolls-across .b-scroll-area__bar--vertical {
    bottom: calc(
      var(--scroll-area-pad-block-end, 0px) + var(--scroll-area-gutter)
    );
  }

  .b-scroll-area--scrolls-down .b-scroll-area__bar--horizontal {
    right: calc(var(--scroll-area-pad-inline, 0px) + var(--scroll-area-gutter));
  }

  /*
   * Held on screen whether or not there is anything to scroll — a bar that
   * comes and goes moves everything beside it, and on a box that fills and
   * empties the flicker is worse than an idle rail.
   */
  .b-scroll-area--visibility-always .b-scrollbar {
    opacity: 1;
    visibility: visible;
  }

  /*
   * Or kept out of the way until asked for: the pointer over the box, the focus
   * inside it, or the content moving. Only the fade is switched — a bar with
   * nothing to scroll stays hidden underneath, since that is the bar's own
   * business and not the mode's.
   */
  .b-scroll-area--visibility-hover .b-scrollbar {
    opacity: 0;
  }

  .b-scroll-area--visibility-hover:hover .b-scrollbar--overflowing,
  .b-scroll-area--visibility-hover:focus-within .b-scrollbar--overflowing,
  .b-scroll-area--visibility-hover.b-scroll-area--scrolling
    .b-scrollbar--overflowing {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .b-scroll-area__viewport {
      scroll-behavior: auto;
    }
  }
</style>
