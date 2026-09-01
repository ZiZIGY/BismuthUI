# bismuth-ui

Vue 3 components cut from hexagons. The bevel is always 45°, the contour is a
stack of CSS layers rather than a border, and the whole palette moves on one
custom property.

```
npm i bismuth-ui
```

```ts
import { BButton, BSelect } from 'bismuth-ui';
import 'bismuth-ui/style.css';
```

Peers: `vue` ≥ 3.5, `@vueuse/core`, `motion-v`. `@iconify/vue` is optional and
only wanted by `BThemeToggle`.

## Theming

Components never reach for a palette colour. They read semantic tokens, so a
theme is a handful of custom properties — no rebuild, no config file.

```css
:root {
  --b-surface: #f6f5fa; /* the page */
  --b-elevated: #ffffff; /* the plate a control is cut from */
  --b-line: #d7d4e3; /* contours at rest */
  --b-line-strong: #a9a5bd; /* and under the pointer */
  --b-text: #17161f; /* writing, and what a control falls back to */
}
```

`--b-tone` is the colour a control says things with — fills, focus, the mark on
a chosen row. It is deliberately not declared: left alone, every control takes
the page's own ink, and setting it anywhere overrides that from there down.
So it colours a whole form as readily as one control:

```vue
<div style="--b-tone: #00b073">
  <BSlider v-model="volume" />
  <BSwitch v-model="notify" />
</div>
```

Light and dark are the same tokens declared twice — `[data-theme='light']` and
a `prefers-color-scheme` fallback. `BThemeToggle` flips the attribute.

The iridescent ring has its own: `--b-spectrum` for the colours,
`--b-speed-slow | -normal | -fast` for how fast it travels.

## Sizes

Every component takes `size`: `xs | sm | md | lg | xl`. Sizes are classes, not
inline styles, so a stylesheet can still override them. There are no pixel
props — the geometry is the library's, and only the size and the colour are
yours.

## Components

| | |
| --- | --- |
| `BButton` | `spectrum`, `plain`, `outline` (glass), `ghost` |
| `BInput` `BTextarea` `BField` `BFieldAddon` | the field shell and its slots |
| `BSelect` `BAutocomplete` | grow with their values; a list underneath |
| `BDropdown` `BOption` `BOptionGroup` | a panel on a trigger, and rows for it |
| `BSlider` | ticks, range, a bubble over the handle |
| `BSwitch` `BProgress` `BScrollArea` `BLoader` | |
| `BFrame` `BThumb` | the shape and the handle, for building your own |

Also exported: `vRipple` (the press wave), `cn` (class merge), `useDismiss`,
`useListCursor`, `useFieldControl`, and the `cva` variant builders behind each
component.

## Composing

Nothing is closed. `BDropdown` has one slot and imposes no layout — scrolling
is opt-in, and the regions inside are laid out by whoever uses it. A select
that should read “3 chosen” instead of listing chips is the `value` slot:

```vue
<BSelect v-model="picked" multiple :options="options">
  <template #value="{ option }">
    <span v-if="option.value === picked[0]">Chosen: {{ picked.length }}</span>
  </template>
</BSelect>
```

## Development

```
npm run dev        # the demo stand
npm run build      # the stand, to dist-demo
npm run build:lib  # the package, to dist
```
