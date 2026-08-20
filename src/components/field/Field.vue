<script setup lang="ts">
  import {
    computed,
    provide,
    useAttrs,
    useId,
    useTemplateRef,
    type CSSProperties,
  } from 'vue';
  import BFrame from '../frame/Frame.vue';
  import { cn } from '../../utils/cn';
  import { FIELD_CONTROL_ID, fieldVariants, type IFieldProps } from '.';

  defineOptions({ name: 'BField', inheritAttrs: false });

  const props = withDefaults(defineProps<IFieldProps>(), {
    variant: 'frame',
    size: 'md',
  });

  const attrs = useAttrs();

  const host = useTemplateRef<HTMLElement>('host');

  const controlId = useId();
  provide(FIELD_CONTROL_ID, controlId);

  /*
   * The shell used to be a label, and a label hands its clicks to the control
   * it wraps. That only ever worked for form controls, sent a second click
   * through anything interactive inside, and turned murky once shells started
   * containing one another. One handler says the same thing and says it once:
   * a press on the field's own chrome puts the focus on its control, and a
   * press on something that handles presses itself is left alone.
   *
   * On pointerdown, and cancelled: that is the event the focus moves on, for
   * touch as well as for a mouse, so taking it means the control never loses
   * focus in the first place. Waiting for the click would let it blur, fold the
   * caption away, slide the field up under the pointer and take the focus back
   * — two animations for one press.
   */
  function focusControl(event: PointerEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button, a, input, textarea, select, [tabindex]'))
      return;

    event.preventDefault();
    host.value?.querySelector<HTMLElement>('.b-field__field')?.focus();
  }

  /* class is merged above; everything else — listeners included — goes on the host */
  const hostAttributes = computed(() => {
    const { class: _ignoredClass, ...rest } = attrs;
    return rest;
  });

  /*
   * The only thing written inline: a colour handed in from outside. Sizes are
   * classes — an inline style cannot be overridden from a stylesheet, and a
   * grid that a page cannot retheme is a grid it has to fork.
   */
  const accentStyle = computed<CSSProperties>(() =>
    props.accent ? ({ '--field-accent': props.accent } as CSSProperties) : {}
  );
</script>

<template>
  <div
    ref="host"
    :class="
      cn(
        fieldVariants({ variant }),
        `b-field--${size}`,
        multiline && 'b-field--multiline',
        filled && 'b-field--filled',
        required && 'b-field--required',
        disabled && 'b-field--disabled',
        attrs.class as string
      )
    "
    :style="accentStyle"
    v-bind="hostAttributes"
    @pointerdown="focusControl"
  >
    <div
      v-if="label"
      class="b-field__leader"
    >
      <span
        class="b-field__caption"
        aria-hidden="true"
      >
        <svg
          class="b-field__diagonal"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M0 10 L10 0"
            pathLength="1"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <svg
          class="b-field__shelf"
          viewBox="0 0 10 1"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 0.5 H10"
            pathLength="1"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <span class="b-field__caption-text">{{ label }}</span>
      </span>
    </div>

    <span class="b-field__box">
      <BFrame v-if="variant === 'frame'" />

      <label
        v-if="label"
        class="b-field__label"
        :for="controlId"
      >
        {{ label }}
      </label>

      <slot />
    </span>
  </div>
</template>

<style>
  :where(.b-field) {
    /*
     * What the field says with when it is in use: the contour on focus, the
     * caption, the brackets. The same colour the slider and the switch answer
     * with, reached the same way — `--b-tone` over the page's own ink — so a
     * form coloured by one variable colours all of it.
     */
    --field-accent: var(--b-tone, var(--b-text));
    --field-muted: var(--b-muted);
    --field-danger: var(--b-danger);
    /* buttons in slots must take the field background, not the page one */
    --b-surface: var(--b-elevated);
    --frame-line: var(--b-line);
    --frame-fill: var(--b-elevated);
    --field-leader: var(--b-line-strong);
    --field-leader-stroke: 1.2px;
    --field-reveal: 0.24s;
    /* the leader waits out the placeholder before it starts drawing itself */
    --field-draw: calc(var(--field-reveal) * 0.5);

    --frame-slant: calc(var(--field-height) / 2);

    --field-marker-half: calc(var(--field-font-size) * 0.3);
    --field-marker-size: calc(var(--field-marker-half) * 1.4142);
    --field-marker-rise: calc(var(--field-marker-half) + 1px);
    --field-line: calc(var(--field-font-size) * 1.5);
    /* room above and below one row, so a collapsed box is exactly the height */
    --field-pad-block: calc((var(--field-height) - var(--field-line)) / 2);
    --field-caption-line: calc(var(--field-font-size) * 1.35);
    /*
     * How far the shelf stands off the field. It sets the whole leader: the
     * diagonal runs down it at 45deg, so the caption steps aside by the same
     * amount it steps up, and the strip is that much taller.
     */
    --field-drop: calc(var(--field-font-size) * 0.6);
    --field-leader-height: calc(
      var(--field-caption-line) + var(--field-drop) + var(--field-marker-rise)
    );
  }

  .b-field--xs {
    --field-height: var(--b-field-height-xs);
    --field-font-size: 12px;
    --field-gap: 7px;
    --field-padding-inline: calc(var(--field-height) / 2 + 10px);
  }

  .b-field--sm {
    --field-height: var(--b-field-height-sm);
    --field-font-size: 13px;
    --field-gap: 8px;
    --field-padding-inline: calc(var(--field-height) / 2 + 12px);
  }

  .b-field--md {
    --field-height: var(--b-field-height-md);
    --field-font-size: 14px;
    --field-gap: 10px;
    --field-padding-inline: calc(var(--field-height) / 2 + 16px);
  }

  .b-field--lg {
    --field-height: var(--b-field-height-lg);
    --field-font-size: 16px;
    --field-gap: 12px;
    --field-padding-inline: calc(var(--field-height) / 2 + 20px);
  }

  .b-field--xl {
    --field-height: var(--b-field-height-xl);
    --field-font-size: 18px;
    --field-gap: 14px;
    --field-padding-inline: calc(var(--field-height) / 2 + 24px);
  }

  /*
   * Undressed, the box says the same things the frame would, with one rule
   * under the control: it takes the very colour the frame's contour takes, so
   * hover and focus read the same whichever variant is worn.
   */
  .b-field--line .b-field__box {
    border-bottom: var(--b-stroke, 1.4px) solid var(--frame-line);
    transition: border-color 0.2s ease;
  }

  .b-field:hover {
    --frame-line: var(--b-line-strong);
  }

  /*
   * Lit while the focus is anywhere inside, a button in an addon included:
   * reaching for the clear button is still working with the field, and treating
   * it as leaving would fold the caption away and move the field out from under
   * the pointer mid-click.
   */
  .b-field:focus-within {
    --frame-line: var(--field-accent);
    --field-leader: var(--field-accent);
  }

  /*
   * No band. The frame keeps the band machinery collapsed at rest and never
   * opens it: what marks a focused field is its contour taking the accent,
   * which is what every other control here does.
   *
   * Addressed to its own frame, or a button sitting in a slot would answer
   * along with the field.
   */
  .b-field > .b-field__box > .b-frame {
    --frame-band: 0px;
    --frame-inner-stroke: 0px;
    --frame-glow: 0;
  }

  .b-field > .b-field__box > .b-frame > .b-frame__ring,
  .b-field > .b-field__box > .b-frame::before {
    animation-play-state: paused;
  }

  /*
   * The brackets are the other way about: they mark the one thing that holds
   * the focus, and a button inside brings its own pair. Two sets on one field
   * would be two answers to the same question.
   */
  .b-field:has(.b-field__field:focus) > .b-field__box > .b-frame {
    --frame-focus: var(--field-accent);
    --frame-focus-opacity: 0.9;
    --frame-focus-animation: b-frame-focus-in 0.34s
      cubic-bezier(0.2, 0.8, 0.3, 1) both;
  }

  .b-field--disabled,
  .b-field:has(.b-field__field:disabled) {
    cursor: not-allowed;
    opacity: 0.45;
    filter: saturate(0.12);
  }

  /*
   * A wrapping row: inline addons share it with the control, block ones claim
   * a full basis and are pushed to the ends by their order, so the box lays
   * itself out with no grid template to keep in sync.
   */
  .b-field__box {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    height: var(--field-height);
    padding-inline: var(--field-padding-inline);
    gap: var(--field-gap);
    font-size: var(--field-font-size);
  }

  /*
   * Basis zero, so the control never claims a full row and pushes the addons
   * onto the next one — with a wrapping box that is the difference between a
   * group and a stack.
   *
   * Lifted above the frame, which is positioned and would otherwise paint over
   * it: a positioned element always covers a static one, whatever the order.
   */
  .b-field__field {
    position: relative;
    z-index: 1;
    flex: 1 1 0;
    min-width: 0;
    margin: 0;
    border: 0;
    padding: 0;
    font: inherit;
    color: inherit;
  }

  /*
   * The caption sits right where the control starts, so the gap between the two
   * is cancelled — on the control, never on the caption. A caption carrying a
   * negative margin measures as narrower than nothing, which lets it squeeze
   * onto a full-width block row it has no business being on.
   */
  .b-field:has(.b-field__label) .b-field__field {
    margin-inline-start: calc(var(--field-gap) * -1);
  }

  .b-field__field::placeholder {
    color: color-mix(in oklab, var(--field-muted) 85%, transparent);
  }

  .b-field__addon {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: var(--field-gap);
    color: var(--field-muted);
    transition: color 0.2s ease;
  }

  .b-field:focus-within .b-field__addon {
    color: var(--field-accent);
  }

  .b-field__addon--block-start,
  .b-field__addon--block-end {
    flex-basis: 100%;
  }

  /* align decides the order, so the markup may list addons in any order */
  .b-field__addon--block-start {
    order: -2;
  }

  .b-field__addon--inline-start {
    order: -1;
  }

  .b-field__addon--inline-end {
    order: 1;
  }

  .b-field__addon--block-end {
    order: 2;
  }

  /* a row of its own means the box can no longer be one row tall */
  .b-field__box:has(
    > :is(.b-field__addon--block-start, .b-field__addon--block-end)
  ) {
    height: auto;
    min-height: var(--field-height);
    padding-block: var(--field-pad-block);
  }

  /*
   * Past one row the contour changes character. The bevel is 45deg because it
   * is half the height, and that only holds while the box is one row tall: let
   * it grow and the hexagon's tips flatten out of angle. The blunt outline
   * keeps the angle instead — fixed corners, side edges that stretch — and at
   * one row those edges have zero length, so the two shapes coincide.
   *
   * It is written here rather than asked of the frame as a prop, because only
   * the stylesheet can see the condition: a row of its own is an addon in the
   * box, and `:has()` reads that where script would have to be told.
   *
   * Every layer takes it, band and glow included: leave one on the hexagon and
   * a focused textarea would wear a ring cutting out through its own corners.
   *
   * The formula cannot move into a variable: var() inside a custom property
   * resolves on the element that declares it, while each layer needs its own
   * --frame-layer. Offsets are held to the middle so a short box folds the
   * octagon into a hexagon rather than turning it inside out.
   */
  :is(
      .b-field--multiline .b-field__box,
      .b-field__box:has(
        > :is(.b-field__addon--block-start, .b-field__addon--block-end)
      )
    )
    > .b-frame
    > :is(.b-frame__line, .b-frame__ring, .b-frame__inner),
  :is(
      .b-field--multiline .b-field__box,
      .b-field__box:has(
        > :is(.b-field__addon--block-start, .b-field__addon--block-end)
      )
    )
    > .b-frame::before,
  :is(
      .b-field--multiline .b-field__box,
      .b-field__box:has(
        > :is(.b-field__addon--block-start, .b-field__addon--block-end)
      )
    )
    > .b-frame::after {
    clip-path: polygon(
      var(--frame-layer)
        min(calc(var(--frame-slant) + var(--frame-layer) * 0.4142), 50%),
      min(calc(var(--frame-slant) + var(--frame-layer) * 0.4142), 50%)
        var(--frame-layer),
      max(calc(100% - var(--frame-slant) - var(--frame-layer) * 0.4142), 50%)
        var(--frame-layer),
      calc(100% - var(--frame-layer))
        min(calc(var(--frame-slant) + var(--frame-layer) * 0.4142), 50%),
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

  /* --- leader ------------------------------------------------------------ */

  /*
   * In-flow strip: unfolding it pushes the field down on its own. It leaves the
   * layout entirely when idle, so `display` has to travel with the height —
   * `allow-discrete` holds it on `block` until the collapse has finished.
   *
   * Focus anywhere inside counts, addons included: reaching for the clear
   * button is still working with the field. A select's value is focusable too,
   * so its caption rises the moment the list opens under it.
   */
  .b-field__leader {
    position: relative;
    display: none;
    height: 0;
    overflow: hidden;
    transition:
      height var(--field-reveal) cubic-bezier(0.2, 0.7, 0.3, 1),
      display var(--field-reveal) allow-discrete;
  }

  .b-field:focus-within .b-field__leader,
  .b-field:has(:is(input, textarea).b-field__field:not(:placeholder-shown))
    .b-field__leader,
  .b-field--filled .b-field__leader {
    display: block;
    height: var(--field-leader-height);
  }

  /*
   * Coming back from display: none there is no previous style to leave, so the
   * growth needs a declared origin. Without this the strip would appear open.
   */
  @starting-style {
    .b-field:focus-within .b-field__leader,
    .b-field:has(:is(input, textarea).b-field__field:not(:placeholder-shown))
      .b-field__leader,
    .b-field--filled .b-field__leader {
      height: 0;
    }
  }

  /* the marker belongs to the field: it sits at the tip and is always shown */
  .b-field__box::before {
    content: '';
    position: absolute;
    left: calc(var(--field-marker-size) / 2);
    bottom: calc(
      100% + var(--field-marker-rise) - var(--field-marker-size) / 2
    );
    width: var(--field-marker-size);
    height: var(--field-marker-size);
    background: var(--field-leader);
    border: var(--field-leader-stroke) solid var(--field-leader);
    transform: rotate(45deg);
    transition:
      background 0.2s ease,
      border-color 0.2s ease;
  }

  /*
   * The marker carries it, and only the marker: the leader stays the colour of
   * the field so that being required is not mistaken for being wrong.
   *
   * Either the control says so, or the shell was told — a select's value is a
   * plain element and has no `required` of its own to be read.
   */
  .b-field--required .b-field__box::before,
  .b-field:has(.b-field__field:required) .b-field__box::before {
    background: var(--field-danger);
    border-color: var(--field-danger);
  }

  /*
   * Anchored to the bottom of the strip, not the top: the resting position is
   * the same, but while the strip opens the caption slides up out of the field
   * instead of being revealed from its own top edge.
   */
  .b-field__caption {
    position: absolute;
    bottom: calc(var(--field-drop) + var(--field-marker-rise));
    left: calc(var(--field-marker-size) + var(--field-drop));
    height: var(--field-caption-line);
    padding-inline: 6px 22px;
    font-size: var(--field-font-size);
    line-height: var(--field-caption-line);
    color: var(--field-accent);
    white-space: nowrap;
  }

  /*
   * The leader draws itself in the order a hand would: the shelf across, the
   * diagonal down into the marker, then the word. Straight lines, so the
   * drawing is a scale along their own axis — what a dash offset would look
   * like, without a second way of making shapes in the library.
   *
   * The animations restart on their own: the strip leaves the layout between
   * uses, and nothing inside a box that is not rendered keeps running.
   */
  .b-field__diagonal,
  .b-field__shelf {
    position: absolute;
    overflow: visible;
  }

  .b-field__diagonal path,
  .b-field__shelf path {
    stroke: var(--field-leader);
    stroke-width: var(--field-leader-stroke);
    transition: stroke 0.2s ease;
  }

  /*
   * A square box hung off the caption's lower-left corner, its far corner on
   * the marker: the line runs between the two at 45deg by construction, and
   * needs no figure of its own.
   */
  .b-field__diagonal {
    left: calc(var(--field-drop) * -1);
    bottom: calc(var(--field-drop) * -1);
    width: var(--field-drop);
    height: var(--field-drop);
  }

  .b-field__diagonal path {
    animation: b-field-draw 0.16s ease-out var(--field-draw) both;
  }

  /*
   * Width stated outright. An svg is a replaced element: given both edges and
   * no width it takes its own intrinsic one instead of the space between them,
   * and the shelf came out a stub of a dozen pixels.
   */
  .b-field__shelf {
    bottom: calc(var(--field-leader-stroke) / -2);
    left: 0;
    width: 100%;
    height: var(--field-leader-stroke);
  }

  .b-field__shelf path {
    animation: b-field-draw 0.24s ease-out calc(var(--field-draw) + 0.14s) both;
  }

  /* the word is written rather than faded: uncovered from its first letter */
  .b-field__caption-text {
    display: inline-block;
    animation: b-field-write 0.3s ease-out calc(var(--field-draw) + 0.32s) both;
  }

  /*
   * Uncovered from the left rather than dashed. A dash offset would be the
   * usual way to draw a stroke, but `non-scaling-stroke` resolves every stroke
   * length in screen units, so `pathLength` stops normalising the pattern and
   * what should be one long dash comes out as a row of short ones. Wiping the
   * box has no such quarrel, and both lines start at the left, which is where
   * the marker is. The inset runs a little wide so the stroke's own thickness
   * is not shaved off at the edges.
   */
  @keyframes b-field-draw {
    from {
      clip-path: inset(-3px 100% -3px -3px);
    }

    to {
      clip-path: inset(-3px);
    }
  }

  /*
   * Both ends written out: `none` is the default and it does not interpolate
   * with an inset, so a keyframe that only says `from` would jump.
   */
  @keyframes b-field-write {
    from {
      clip-path: inset(0 100% 0 0);
    }

    to {
      clip-path: inset(0 0 0 0);
    }
  }

  /* --- caption inside the field ------------------------------------------ */

  /*
   * A zero-width item in the row rather than a box at a fixed offset: laid out
   * it lands wherever the control starts, whatever addon precedes it.
   */
  .b-field__label {
    z-index: 1;
    flex: none;
    width: 0;
    font-size: var(--field-font-size);
    line-height: var(--field-line);
    color: var(--field-muted);
    white-space: nowrap;
    pointer-events: none;
    /*
     * The clip is measured against a box of no width, so showing the text means
     * opening it far past the right edge — anything but a negative inset there
     * would cut off the very letters that spill out to be read.
     *
     * It goes at once, with no transition of its own: the caption above is what
     * is worth watching, and two captions crossing over would only compete.
     */
    clip-path: inset(0 -100em 0 0);
  }

  /*
   * Once on the leader the caption hides, but not via display: none — the host
   * names the field and its text has to stay for assistive tech. Clipped from
   * the far end rather than the middle, so it is unwritten letter by letter on
   * the way out and written back the same way when the field empties.
   */
  .b-field:focus-within .b-field__label,
  .b-field:has(:is(input, textarea).b-field__field:not(:placeholder-shown))
    .b-field__label,
  .b-field--filled .b-field__label {
    clip-path: inset(0 0 0 0);
  }

  /* while the caption lies in the field, the placeholder underneath is noise */
  .b-field__label ~ .b-field__field::placeholder {
    color: transparent;
  }

  .b-field:has(.b-field__field:focus)
    .b-field__label
    ~ .b-field__field::placeholder {
    color: color-mix(in oklab, var(--field-muted) 85%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    :where(.b-field) {
      --field-reveal: 0s;
    }
  }

  /* --- multiline ---------------------------------------------------------- */

  /*
   * The bevel stays at half the base height whatever the box does, and that is
   * the whole trick: at one row the blunt contour's vertical edges have zero
   * length, so it is the input hexagon exactly. Every further row only draws
   * those edges out, turning the shape into an octagon with the same corners.
   */
  .b-field--multiline .b-field__box {
    height: auto;
    min-height: var(--field-height);
    align-items: flex-start;
    padding-block: var(--field-pad-block);
  }

  /* `field-sizing` lets the control follow its own text; no measuring needed */
  .b-field--multiline .b-field__field {
    field-sizing: content;
    min-height: var(--field-line);
    line-height: var(--field-line);
    resize: none;
  }

  .b-field--multiline .b-field__addon {
    align-self: flex-start;
  }

  @media (prefers-reduced-motion: reduce) {
    .b-field__diagonal path,
    .b-field__shelf path,
    .b-field__caption-text {
      animation: none;
    }
  }
</style>
