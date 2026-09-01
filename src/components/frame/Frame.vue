<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue';
  import type { TSpeed } from '../../theme/types';

  defineOptions({ name: 'BFrame' });

  /**
   * The signature frame: a stack of layers sharing one clip-path, each pushed
   * inwards by its own `--frame-layer` — line, rainbow band, inner line, fill.
   *
   * The bevel is always 45deg, so a vertex moves inwards exactly sqrt(2) times
   * further than an edge, and a layer bevel shrinks by the inset. Both are
   * constants in calc(), which is why the frame never measures itself and runs
   * no geometry in JS: sizes arrive as `--frame-slant`, `--frame-stroke` and
   * `--frame-band`.
   */
  const props = withDefaults(
    defineProps<{
      /** Rhombus with equal diagonals instead of a hexagon. */
      rhombus?: boolean;
      /** Cuts the tips flat, turning the hexagon into an octagon. */
      blunt?: boolean;
      /** Rainbow band between the lines. */
      band?: boolean;
      /** Blurred copy of the band beneath the contour. */
      glow?: boolean;
      /** No plate: what stands behind shows through the shape, refracted. */
      glass?: boolean;
      /** Band palette. First and last colour must match. */
      colors?: readonly string[];
      /** How fast the ring travels. Named speeds live in the theme. */
      speed?: TSpeed;
    }>(),
    { band: true, glow: true }
  );

  /*
   * Only a palette given from outside is written here. Left alone, the ring
   * falls back to the theme's `--b-spectrum`, which is what makes recolouring
   * it a matter of one custom property rather than a prop on every frame.
   */
  const spectrumStyle = computed<CSSProperties>(() =>
    props.colors
      ? ({ '--frame-spectrum': props.colors.join(', ') } as CSSProperties)
      : {}
  );
</script>

<template>
  <span
    class="b-frame"
    :class="{
      [`b-frame--${speed}`]: speed,
      'b-frame--rhombus': rhombus,
      'b-frame--blunt': blunt,
      'b-frame--band': band,
      'b-frame--glow': band && glow,
      'b-frame--glass': glass,
    }"
    :style="spectrumStyle"
    aria-hidden="true"
  >
    <span
      v-if="glass"
      class="b-frame__pane"
    />
    <span class="b-frame__line" />
    <span
      v-if="band"
      class="b-frame__ring"
    />
    <span
      v-if="band"
      class="b-frame__inner"
    />
    <span class="b-frame__focus" />
  </span>
</template>

<style>
  /*
   * Sizes and colours are inherited from the component, so they must not be
   * declared here: an element's own value always beats an inherited one.
   * Defaults live in the var() fallbacks instead.
   */
  :where(.b-frame) {
    /* every frame mutes focus, otherwise a nested one picks up its parent */
    --frame-focus-opacity: 0;
    --frame-focus-animation: none;
    --frame-focus-arm: calc(var(--frame-slant, 16px) * 0.6);
    --frame-focus-gap: calc(var(--frame-stroke, var(--b-stroke, 1.6px)) * 3);
    --frame-focus-travel: calc(var(--frame-slant, 16px) * 0.5);

    /* layer insets: line -> band -> inner line -> fill */
    --frame-inner-stroke: calc(
      var(--frame-stroke, var(--b-stroke, 1.6px)) * 0.8
    );
    --frame-ring-inset: var(--frame-stroke, var(--b-stroke, 1.6px));
    --frame-inner-inset: calc(
      var(--frame-stroke, var(--b-stroke, 1.6px)) + var(--frame-band, 0px)
    );
    --frame-fill-inset: calc(
      var(--frame-inner-inset) + var(--frame-inner-stroke)
    );

    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /*
   * Contour of every layer. The formula cannot move into a variable: var()
   * inside a custom property resolves on the element that declares it, while we
   * need the --frame-layer of each individual layer. Hence the inline polygon.
   *
   * At 45deg a vertex moves in by layer * sqrt(2) and an edge by layer, so the
   * layer bevel equals slant + layer * 0.4142.
   */
  .b-frame__pane,
  .b-frame__line,
  .b-frame__ring,
  .b-frame__inner,
  .b-frame::before,
  .b-frame::after {
    position: absolute;
    inset: 0;
    clip-path: polygon(
      calc(var(--frame-layer) * 1.4142) 50%,
      calc(var(--frame-slant, 16px) + var(--frame-layer) * 0.4142)
        var(--frame-layer),
      calc(100% - var(--frame-slant, 16px) - var(--frame-layer) * 0.4142)
        var(--frame-layer),
      calc(100% - var(--frame-layer) * 1.4142) 50%,
      calc(100% - var(--frame-slant, 16px) - var(--frame-layer) * 0.4142)
        calc(100% - var(--frame-layer)),
      calc(var(--frame-slant, 16px) + var(--frame-layer) * 0.4142)
        calc(100% - var(--frame-layer))
    );
  }

  /*
   * Blunt tips: instead of meeting in a point the bevels stop at a short
   * vertical edge. At 45deg its ends shift by layer * 0.4142, the same figure
   * the slanted edges use.
   *
   * Every offset is held to the middle. Let a box grow shorter than two bevels
   * and the two cuts would cross, turning the outline inside out — it renders
   * as a rectangle. Clamped, the octagon simply loses its edges and becomes the
   * hexagon, then the rhombus, which is what those shapes are anyway.
   */
  .b-frame--blunt .b-frame__pane,
  .b-frame--blunt .b-frame__line,
  .b-frame--blunt .b-frame__ring,
  .b-frame--blunt .b-frame__inner,
  .b-frame--blunt::before,
  .b-frame--blunt::after {
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

  /* a rhombus has no flat edges, so both vertices follow the bisector */
  .b-frame--rhombus .b-frame__pane,
  .b-frame--rhombus .b-frame__line,
  .b-frame--rhombus .b-frame__ring,
  .b-frame--rhombus .b-frame__inner,
  .b-frame--rhombus::before,
  .b-frame--rhombus::after {
    clip-path: polygon(
      calc(var(--frame-layer) * 1.4142) 50%,
      50% calc(var(--frame-layer) * 1.4142),
      calc(100% - var(--frame-layer) * 1.4142) 50%,
      50% calc(100% - var(--frame-layer) * 1.4142)
    );
  }

  /* glow is the same band, blurred and sitting under every layer */
  .b-frame::before {
    --frame-layer: var(--frame-ring-inset);

    content: '';
    display: none;
    opacity: var(--frame-glow, 0.5);
    filter: blur(calc(var(--frame-band, 0px) * 1.6));
    transition: opacity 0.25s ease;
  }

  .b-frame--glow::before {
    display: block;
  }

  .b-frame__line {
    --frame-layer: 0px;

    background: var(--frame-line, var(--b-text));
    transition: background 0.2s ease;
  }

  /*
   * A conic gradient wraps the shape instead of sweeping across it, so the
   * spectrum runs around the contour and closes on itself. Animating the angle
   * needs @property: without a registered type it would not interpolate.
   */
  @property --frame-spin {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .b-frame__ring,
  .b-frame::before {
    background-image: conic-gradient(
      from var(--frame-spin) at 50% 50%,
      var(--frame-spectrum, var(--b-spectrum))
    );
    animation: b-frame-spectrum var(--frame-duration, var(--b-speed-normal))
      linear infinite;
  }

  /* the named speeds; without one the ring keeps the theme's normal pass */
  .b-frame--none {
    --frame-duration: 0s;
  }

  .b-frame--slow {
    --frame-duration: var(--b-speed-slow);
  }

  .b-frame--normal {
    --frame-duration: var(--b-speed-normal);
  }

  .b-frame--fast {
    --frame-duration: var(--b-speed-fast);
  }

  .b-frame__ring {
    --frame-layer: var(--frame-ring-inset);
  }

  .b-frame__inner {
    --frame-layer: var(--frame-inner-inset);

    background: var(--frame-line, var(--b-text));
    transition: background 0.2s ease;
  }

  .b-frame::after {
    --frame-layer: var(--frame-fill-inset);

    content: '';
    /*
     * The thickness seen edge-on, over whatever colour the plate was given.
     * Two layers in one declaration rather than a pseudo-element, since the
     * fill layer has none to spare — it is a pseudo-element itself.
     */
    background:
      linear-gradient(
        90deg,
        var(--frame-edge, rgb(0 0 0 / 0.05)) 0,
        color-mix(
            in oklab,
            var(--frame-edge, rgb(0 0 0 / 0.05)) 34%,
            transparent
          )
          calc(var(--frame-edge-reach, 6em) * 0.4),
        transparent var(--frame-edge-reach, 6em),
        transparent calc(100% - var(--frame-edge-reach, 6em)),
        color-mix(
            in oklab,
            var(--frame-edge, rgb(0 0 0 / 0.05)) 34%,
            transparent
          )
          calc(100% - var(--frame-edge-reach, 6em) * 0.4),
        var(--frame-edge, rgb(0 0 0 / 0.05)) 100%
      ),
      var(--frame-fill, var(--b-elevated));
    transition: background 0.2s ease;
  }

  /*
   * With no band there is no inner line either, so both the plate and the pane
   * meet the contour directly. Left at the full inset the pane stops short of
   * it and the line layer — a filled silhouette — shows through the gap as a
   * dark strip along the top and bottom edges.
   */
  .b-frame:not(.b-frame--band) .b-frame__pane,
  .b-frame:not(.b-frame--band)::after {
    --frame-layer: var(--frame-stroke, var(--b-stroke, 1.6px));
  }

  /*
   * Glass: nothing is painted where the plate would be, and what stands behind
   * is refracted instead. The filter goes on the fill layer rather than on the
   * component, so it is clipped to the silhouette — put on the box it would
   * bend a rectangle of the page around a shape that is not one.
   */
  /*
   * The pane, and the one layer of the frame that is not clipped by a polygon.
   *
   * That is the whole reason it exists. `clip-path` puts an element into a
   * composite pass of its own, and a backdrop filter has nothing to reach
   * through once it is there — every other layer here is clipped, so a filter
   * on any of them refracts nothing at all. This one is a plain rectangle with
   * the filter on it, and the shape is cut out of it by the parent instead.
   *
   * It wears the plate the solid variants wear, at a fraction of its weight:
   * the fold across the middle, the diagonal light along it and a little body.
   * That fold is the whole of the thickness — one half catching the light and
   * the other turned away is what an eye reads as a solid.
   */
  /*
   * First of the layers, so the contour and the band are painted over it —
   * order in the markup is all it takes, and it has to be all it takes: a depth
   * of its own would want a stacking context to be measured in, and any way of
   * making one cuts the pane off from the backdrop it exists to read.
   *
   * The press wave is painted by the button, over the frame entirely, so it
   * never ends up behind the glass and never gets dragged out into a streak.
   */
  .b-frame__pane {
    --frame-layer: var(--frame-fill-inset);

    position: absolute;
    inset: 0;
    background: var(--frame-glass, var(--b-fill-glass));
    /*
     * Frosted, and nothing more. Real refraction wants an SVG filter in the
     * backdrop, which Chromium alone reads — and reads inconsistently, the
     * capture depending on where the compositor has put the element, so the
     * same button refracts differently at different scroll positions. A blur
     * behaves the same everywhere and at every height, which is worth more
     * here than a bend that only some people see and none see reliably.
     */
    backdrop-filter: blur(3px) saturate(1.35);
  }

  /*
   * The frame casts nothing, and carries no filter at all. It used to cast a
   * drop-shadow, which had to be a filter so it would follow the clipped
   * silhouette rather than the box — but a filter on an element cuts
   * everything inside it off from the backdrop, so the glass variant spent
   * that filter's whole life switching it back off. Between a shadow three
   * variants suppressed by hand and a pane that reads what is behind it, the
   * pane is worth more.
   *
   * What stands in for depth is the plate on the pane: a fold across the
   * middle, one half catching the light and the other turned away, which is
   * what an eye reads as thickness anyway.
   */

  /* nothing is painted where the plate would be; the pane stands in for it */
  .b-frame--glass::after {
    background: transparent;
  }

  /*
   * The lit edge of the cut, and the one thing a glass frame has that does not
   * depend on what is behind it. Over a picture the backdrop carries the
   * depth; over a flat panel there is nothing to carry it, and without this
   * the shape reads as a hole rather than a solid.
   *
   * It stays narrow on purpose. Spread inwards it becomes a wash across the
   * middle, and a wash is what the opaque plate already is — which is exactly
   * the resemblance being avoided here.
   */
  .b-frame--glass .b-frame__pane::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 0 var(--frame-sheen-edge, 1px)
      color-mix(
        in oklab,
        var(--frame-sheen, var(--b-highlight)) var(--frame-sheen-strength, 20%),
        transparent
      );
  }

  /*
   * The thickness seen edge-on: darker where the pane is deepest, which on a
   * shape this wide is the two ends. A gradient does it rather than a shadow,
   * because a spread inset shadow follows the border box and would band the
   * top and bottom as well — here the width is what matters and the height is
   * a few pixels, so shading it top to bottom only greys the whole thing.
   *
   * The reach is a length, not a share of the width: a switch is a third the
   * width of a field, and a percentage would eat half of it while barely
   * touching the field. In `em` it stays the same visual depth on both.
   *
   * A stop partway in, at a third of the strength: two stops make a straight
   * ramp, and a straight ramp reads as a wedge with a visible end. Bending it
   * puts most of the fall in the first stretch and lets the rest die out.
   *
   * Painted over the pane's own sheen and under the contour, which is what
   * markup order gives — the pane is one layer, so order is the only depth
   * there is.
   */
  .b-frame--glass .b-frame__pane::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        90deg,
        var(--frame-edge, rgb(0 0 0 / 0.05)) 0,
        color-mix(
            in oklab,
            var(--frame-edge, rgb(0 0 0 / 0.05)) 34%,
            transparent
          )
          calc(var(--frame-edge-reach, 6em) * 0.4),
        transparent var(--frame-edge-reach, 6em),
        transparent calc(100% - var(--frame-edge-reach, 6em)),
        color-mix(
            in oklab,
            var(--frame-edge, rgb(0 0 0 / 0.05)) 34%,
            transparent
          )
          calc(100% - var(--frame-edge-reach, 6em) * 0.4),
        var(--frame-edge, rgb(0 0 0 / 0.05)) 100%
      );
  }


  /*
   * Real transparency also needs the line layer to become a ring: a filled
   * outer contour with the inner one punched out, or the solid silhouette
   * underneath shows through the hole. polygon() cannot hold a hole, but
   * shape() can — it takes percentages and an evenodd rule.
   *
   * Written for the hexagon alone. A rhombus or a blunt tip would each need
   * their own, and neither has asked yet.
   *
   * Where shape() is missing the layer stays solid, which is what every other
   * frame does, so nothing breaks.
   */
  @supports (clip-path: shape(from 0 0, line to 1px 1px)) {
    .b-frame--glass .b-frame__line {
      --ring: var(--frame-stroke, var(--b-stroke, 1.6px));

      clip-path: shape(
        evenodd from 0% 50%,
        line to var(--frame-slant) 0%,
        line to calc(100% - var(--frame-slant)) 0%,
        line to 100% 50%,
        line to calc(100% - var(--frame-slant)) 100%,
        line to var(--frame-slant) 100%,
        close,
        move to calc(var(--ring) * 1.4142) 50%,
        line to calc(var(--frame-slant) + var(--ring) * 0.4142) var(--ring),
        line to calc(100% - var(--frame-slant) - var(--ring) * 0.4142)
          var(--ring),
        line to calc(100% - var(--ring) * 1.4142) 50%,
        line to calc(100% - var(--frame-slant) - var(--ring) * 0.4142)
          calc(100% - var(--ring)),
        line to calc(var(--frame-slant) + var(--ring) * 0.4142)
          calc(100% - var(--ring)),
        close
      );
    }
  }

  /* --- focus ------------------------------------------------------------ */

  /*
   * Brackets on the tips: a square with two adjacent borders, turned 45deg,
   * repeats the angle at which the bevels meet.
   */
  .b-frame__focus::before,
  .b-frame__focus::after {
    content: '';
    position: absolute;
    top: 50%;
    width: var(--frame-focus-arm);
    height: var(--frame-focus-arm);
    opacity: var(--frame-focus-opacity);
    transform: translate(-50%, -50%) rotate(45deg);
    transition: opacity 0.12s ease;
    animation: var(--frame-focus-animation);
  }

  .b-frame__focus::before {
    --frame-focus-from: calc(var(--frame-focus-travel) * -1);

    left: calc(var(--frame-focus-gap) * -1);
    border-left: var(--frame-stroke, var(--b-stroke, 1.6px)) solid
      var(--frame-focus, currentColor);
    border-bottom: var(--frame-stroke, var(--b-stroke, 1.6px)) solid
      var(--frame-focus, currentColor);
  }

  .b-frame__focus::after {
    --frame-focus-from: var(--frame-focus-travel);

    left: calc(100% + var(--frame-focus-gap));
    border-top: var(--frame-stroke, var(--b-stroke, 1.6px)) solid
      var(--frame-focus, currentColor);
    border-right: var(--frame-stroke, var(--b-stroke, 1.6px)) solid
      var(--frame-focus, currentColor);
  }

  @keyframes b-frame-focus-in {
    from {
      opacity: 0;
      transform: translate(-50%, -50%)
        translateX(calc(var(--frame-focus-from) * 1.6)) rotate(45deg);
    }
    60% {
      opacity: 1;
      transform: translate(-50%, -50%)
        translateX(calc(var(--frame-focus-from) * -0.18)) rotate(45deg);
    }
    to {
      opacity: var(--frame-focus-opacity);
      transform: translate(-50%, -50%) rotate(45deg);
    }
  }

  :focus-visible > .b-frame {
    --frame-focus-opacity: 0.9;
    --frame-focus-animation: b-frame-focus-in 0.34s
      cubic-bezier(0.2, 0.8, 0.3, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    .b-frame__ring,
    .b-frame::before,
    .b-frame__focus::before,
    .b-frame__focus::after {
      animation: none;
    }
  }
</style>
