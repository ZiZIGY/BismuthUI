<script setup lang="ts">
  import type { TSize } from '../../theme/types';

  defineOptions({ name: 'BDivider' });

  /**
   * A rule with a rhombus set into it. Two elements: the line runs the full
   * width and the stone sits over the middle of it, solid, so the line goes in
   * one side and out the other.
   *
   * The stone is the same square turned 45deg that the handle, the slider's
   * step marks and the focus brackets are cut from. Nothing here needs a path,
   * so nothing here has one.
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
    <span class="b-divider__rule" />

    <span
      class="b-divider__gem"
      aria-hidden="true"
    />
  </div>
</template>

<style>
  .b-divider--xs {
    --divider-gem: 7px;
  }

  .b-divider--sm {
    --divider-gem: 9px;
  }

  .b-divider--md {
    --divider-gem: 11px;
  }

  .b-divider--lg {
    --divider-gem: 14px;
  }

  .b-divider--xl {
    --divider-gem: 18px;
  }

  :where(.b-divider) {
    --divider-line: var(--b-line);
    --divider-stroke: var(--b-stroke, 1.4px);

    position: relative;
    display: flex;
    align-items: center;
    /*
     * The stone stands taller than the line and is taken out of the flow, so
     * the box is told to make room for it — otherwise the component measures
     * shorter than it draws and whatever sits under it is struck by the tips.
     *
     * A square turned 45deg stands `side * 1.4142` across its diagonal.
     */
    min-height: calc(var(--divider-gem) * 1.4142);
  }

  .b-divider__rule {
    width: 100%;
    height: var(--divider-stroke);
    background: var(--divider-line);
  }

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
