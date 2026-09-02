<script setup lang="ts">
  import type { TSize } from '../../theme/types';

  defineOptions({ name: 'BDivider' });

  /**
   * A rule with a rhombus set into it: one line the full width, two more drawn
   * back from the ends and broken either side of the centre, and the stone
   * sitting over the break.
   *
   * Four elements and no drawing. The rhombus is the same square turned 45deg
   * that the handle, the step marks and the focus brackets are cut from, and
   * the lines are boxes — nothing here needs a path, so nothing here has one.
   *
   * Decorative by default. Given a `label` it becomes a real separator and
   * says so; without one there is nothing to announce, and a screen reader is
   * better off skipping it.
   */
  withDefaults(defineProps<{ size?: TSize; label?: string }>(), {
    size: 'md',
  });
</script>

<template>
  <div
    :class="['b-divider', `b-divider--${size}`]"
    :role="label ? 'separator' : 'presentation'"
    :aria-label="label"
  >
    <span class="b-divider__rule b-divider__rule--drawn" />
    <span class="b-divider__rule" />
    <span class="b-divider__rule b-divider__rule--drawn" />

    <span
      class="b-divider__gem"
      aria-hidden="true"
    />
  </div>
</template>

<style>
  .b-divider--xs {
    --divider-gap: 3px;
    --divider-gem: 14px;
    --divider-notch: 10px;
  }

  .b-divider--sm {
    --divider-gap: 4px;
    --divider-gem: 19px;
    --divider-notch: 13px;
  }

  .b-divider--md {
    --divider-gap: 5px;
    --divider-gem: 24px;
    --divider-notch: 17px;
  }

  .b-divider--lg {
    --divider-gap: 6px;
    --divider-gem: 31px;
    --divider-notch: 22px;
  }

  .b-divider--xl {
    --divider-gap: 7px;
    --divider-gem: 38px;
    --divider-notch: 27px;
  }

  :where(.b-divider) {
    --divider-line: var(--b-line);
    --divider-stroke: var(--b-stroke, 1.4px);
    /* how far the drawn-back pair stops short of each end */
    --divider-inset: 15%;

    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--divider-gap);
    /*
     * The stone stands taller than the three lines together and is taken out
     * of the flow, so the box is told to make room for it — otherwise the
     * component measures shorter than it draws and whatever sits under it is
     * struck by the tips.
     *
     * A square turned 45deg stands `side * 1.4142` across its diagonal.
     */
    min-height: calc(var(--divider-gem) * 1.4142);
  }

  .b-divider__rule {
    height: var(--divider-stroke);
    background: var(--divider-line);
  }

  /*
   * The outer pair: pulled back from the ends, and parted in the middle for
   * the stone. The break is a gap in the paint rather than two elements —
   * a line with a hole in it is one gradient, and two of them would be four
   * boxes to keep in step.
   */
  .b-divider__rule--drawn {
    margin-inline: var(--divider-inset);
    background: linear-gradient(
      90deg,
      var(--divider-line) 0 calc(50% - var(--divider-notch)),
      transparent calc(50% - var(--divider-notch))
        calc(50% + var(--divider-notch)),
      var(--divider-line) calc(50% + var(--divider-notch))
    );
  }

  /*
   * Over the middle line rather than notched around it: the stone is solid, so
   * the line simply runs behind it and out the other side, which is what the
   * two halves either side of it are.
   */
  .b-divider__gem {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--divider-gem);
    height: var(--divider-gem);
    background: var(--divider-line);
    transform: translate(-50%, -50%) rotate(45deg);
  }
</style>
