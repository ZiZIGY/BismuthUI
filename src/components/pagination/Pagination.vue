<script setup lang="ts">
  import { computed } from 'vue';
  import BButton from '../button/Button.vue';
  import { cn } from '../../utils/cn';
  import { paginationVariants, type IPaginationProps } from '.';

  defineOptions({ name: 'BPagination', inheritAttrs: false });

  /**
   * Pages as buttons turned rhombi — `BButton` with `square`, the same shape
   * an icon-only button wears — with the page number inside. Everything a
   * button already does (the press wave, the focus ring, the bevels, the
   * disabled state) comes for free, since a real `BButton` is doing the
   * drawing rather than a shape imitating one.
   *
   * All of them wear `plain`, the one quiet contour, and the page you are on
   * is picked out by colour alone — the same line and fill the rest of the
   * library uses to mark a chosen thing, not a variant of its own.
   *
   * The slot fills the button rather than replacing it: what a `BButton`
   * carries — the shape, the press, `aria-current`, the label — stays there
   * whatever is put inside, and the caller only ever swaps the page's face.
   *
   * A long run is broken rather than drawn out: the ends, a window around the
   * current page, and a mark for everything skipped.
   */
  const props = withDefaults(defineProps<IPaginationProps>(), {
    siblings: 1,
    size: 'md',
    arrows: true,
  });

  const model = defineModel<number>({ default: 1 });

  const current = computed(() =>
    Math.min(Math.max(model.value, 1), Math.max(props.total, 1))
  );

  function range(from: number, to: number) {
    return Array.from({ length: to - from + 1 }, (_, at) => from + at);
  }

  const pages = computed<(number | 'gap')[]>(() => {
    const total = props.total;
    const around = props.siblings;

    /*
     * Both ends, both breaks, the current page and its neighbours. Fewer pages
     * than that and a break would hide nothing, so the run is shown whole.
     */
    if (total <= around * 2 + 5) return range(1, total);

    const from = Math.max(current.value - around, 2);
    const to = Math.min(current.value + around, total - 1);

    return [
      1,
      ...(from > 2 ? (['gap'] as const) : []),
      ...range(from, to),
      ...(to < total - 1 ? (['gap'] as const) : []),
      total,
    ];
  });

  function select(page: number) {
    const next = Math.min(Math.max(page, 1), props.total);
    if (next !== model.value) model.value = next;
  }
</script>

<template>
  <nav
    v-bind="$attrs"
    :class="cn(paginationVariants({ size }), $attrs.class as string)"
    aria-label="Pagination"
  >
    <BButton
      v-if="arrows"
      square
      variant="ghost"
      :size
      :disabled="current <= 1"
      aria-label="Previous page"
      @click="select(current - 1)"
    >
      <slot
        name="prev"
        :disabled="current <= 1"
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          class="size-[0.7em] fill-current"
        >
          <path d="M10.6 2.6 9.2 1.2 2.4 8l6.8 6.8 1.4-1.4L5.2 8z" />
        </svg>
      </slot>
    </BButton>

    <template
      v-for="(page, at) in pages"
      :key="at"
    >
      <span
        v-if="page === 'gap'"
        class="b-pagination__gap"
        aria-hidden="true"
      >
        <slot name="gap">…</slot>
      </span>

      <BButton
        v-else
        square
        variant="plain"
        :class="page === current && 'b-pagination__page--active'"
        :size
        :aria-label="`Page ${page}`"
        :aria-current="page === current ? 'page' : undefined"
        @click="select(page)"
      >
        <slot
          name="page"
          :page
          :active="page === current"
        >
          {{ page }}
        </slot>
      </BButton>
    </template>

    <BButton
      v-if="arrows"
      square
      variant="ghost"
      :size
      :disabled="current >= total"
      aria-label="Next page"
      @click="select(current + 1)"
    >
      <slot
        name="next"
        :disabled="current >= total"
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          class="size-[0.7em] fill-current"
        >
          <path d="M5.4 2.6 6.8 1.2 13.6 8l-6.8 6.8-1.4-1.4L10.8 8z" />
        </svg>
      </slot>
    </BButton>
  </nav>
</template>

<style>
  :where(.b-pagination) {
    gap: 0.35em;
  }

  .b-pagination--xs {
    font-size: 12px;
  }

  .b-pagination--sm {
    font-size: 13px;
  }

  .b-pagination--md {
    font-size: 14px;
  }

  .b-pagination--lg {
    font-size: 16px;
  }

  .b-pagination--xl {
    font-size: 18px;
  }

  /*
   * The current page, said in the colour the rest of the library already uses
   * for a chosen thing — the same accent an option or a tab picks out with,
   * not a variant of its own.
   */
  .b-pagination__page--active {
    --frame-line: var(--b-tone, var(--b-text));

    color: var(--b-tone, var(--b-text));
  }

  /*
   * Sized off the font rather than off `--button-height`: that variable lives
   * on the button's own size class, out of reach for a plain sibling, while
   * the font size is already the pagination's own size grid.
   */
  .b-pagination__gap {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-width: 2em;
    height: 2em;
    color: var(--b-muted);
    line-height: 1;
  }
</style>
