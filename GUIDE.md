# Grid Tool — Developer Guide

> How this repo works, how to extend it, and what to watch out for.

---

## What it is

A browser-based design tool for building and exporting a CSS grid system with a mathematically derived type scale. Every dimension — column widths, row heights, and all font sizes — traces back to one number: the **row height**, which is measured live from the DOM.

---

## File structure

```
src/
  app.css               Global reset + Tailwind import + grid-layer overflow rule
  app.html              Bare HTML shell
  routes/
    +layout.svelte      Imports app.css, renders children
    +page.svelte        The entire app — state, UI, export logic
```

Everything lives in `+page.svelte`. There are no sub-components yet. This is intentional for now — the whole system is tightly coupled state, and splitting it prematurely adds indirection without benefit.

---

## How state works

All reactive state uses **Svelte 5 runes** (`$state`, `$derived`, `$effect`).

### Grid state
```js
let cols   = $state(12);
let rows   = $state(8);
let gutter = $state(1);   // rem
let margin = $state(2);   // rem
```

### Measurements (DOM-derived)
```js
let colWidth  = $state(0);   // populated by bind:clientWidth on .measure div
let rowHeight = $state(0);   // populated by bind:clientHeight on .measure div
let rootPx    = $state(16);  // actual computed font-size of <html>
```

The `.measure` div sits in an invisible grid layer that always renders, even when tabs switch. This keeps `colWidth` and `rowHeight` live at all times.

### Type scale
```js
let tx1 = $derived(rowHeight / rootPx);               // ×1 — 1 row
let tx2 = $derived(spanPx(2, rowHeight) / rootPx);    // ×2 — 2 rows + 1 gutter
// etc.
let td2 = $derived(tx1 / 2);                          // ÷2 — ½ row
// etc.
```

`spanPx(n, track)` = `n × track + (n-1) × gutterPx`. This is the single formula that makes multi-row sizes correct — the gutter between tracks is included.

### Per-size typography
```js
const DEFAULTS = { tx5: { weight, ls, ml }, tx4: {...}, ... };
let typo = $state(structuredClone(DEFAULTS));
const typoMap = typo; // cast to Record<string, ...> for dynamic key access
```

Mutate via `typoMap[key].weight = value`. Svelte's proxy tracks the mutation.

---

## The scrubber action

```js
function scrub(node, { get, set, sensitivity, min, max, step }) { ... }
```

A [Svelte action](https://svelte.dev/docs/svelte/use) attached to `<span>` elements. On `mousedown` it listens to `mousemove` on `window`, computes delta × sensitivity, snaps to `step`, clamps to `[min, max]`, and calls `set()`. The body cursor is forced to `ew-resize` during drag to prevent flicker.

Usage:
```svelte
<span use:scrub={{ get: () => cols, set: v => cols = v, sensitivity: 0.15, min: 1, max: 48, step: 1 }}>
  cols <b>{cols}</b>
</span>
```

---

## Grid layers

The canvas is built from stacked `position: fixed; inset: 0; display: grid` divs:

| Layer | Purpose | `pointer-events` |
|-------|---------|-----------------|
| Measurement | Invisible single cell, feeds `colWidth`/`rowHeight` | none |
| Cells | `cols × rows` bordered divs | none |
| Cols | `cols` full-height column bands | none |
| Rows | `rows` full-width row bands | none |
| Content | Typography / composition | auto |

All layers share the same `gridStyle` derived value so they're always in sync.

### The global overflow rule
```css
/* app.css */
.grid-layer * {
  min-width: 0;
  min-height: 0;
  overflow: visible;
}
```

This prevents content from pushing grid track sizes. `min-width: 0` overrides CSS grid's `auto` default which would let content stretch columns. Content spills visually but never affects layout.

---

## The type tab

Uses a **scrollable canvas** (`position: fixed; overflow-y: scroll`) containing a grid with explicit `${rowHeight}px` row heights instead of `1fr`. This keeps each row exactly as tall as the main grid while allowing scroll.

`TYPE_SIZES` defines all 9 sizes with their `startRow` and `span` (how many rows they occupy):
```js
const TYPE_SIZES = [
  { key: 'tx5', label: '×5', def: '5 rows + 4 gutters', span: 5, startRow: 2 },
  // ...
];
```

---

## The guide tab

Same scrollable grid approach as the type tab (`guideGridStyle`). All text uses `td4` (¼ row) set via `--gs` CSS variable on the grid parent. Column zones (`gz`) are computed from `cp` (composition positions) to divide the content area into token / label / definition / value bands.

---

## CSS export

Three functions, all reading live state at call time:

| Function | Output |
|----------|--------|
| `gridCSS()` | `:root` vars + `.grid` class |
| `fontCSS()` | `:root` type vars + per-size `.t-*` classes |
| `tailwindCSS()` | `@theme` block for Tailwind v4 |
| `guideMD()` | Full markdown reference document |
| `guideJSON()` | Structured JSON for agent consumption |

Call `copy(key)` to write any of these to the clipboard with a 1.5s "Copied" flash.

---

## Adding a new type size

1. Add the derived value:
   ```js
   let tx6 = $derived(spanPx(6, rowHeight) / rootPx);
   ```
2. Add to `sizeVals`:
   ```js
   let sizeVals = $derived({ ..., tx6 });
   ```
3. Add to `DEFAULTS`:
   ```js
   tx6: { weight: 400, ls: 0, ml: -0.09 }
   ```
4. Add to `TYPE_SIZES` with the correct `startRow` (= previous last startRow + previous span):
   ```js
   { key: 'tx6', label: '×6', def: '6 rows + 5 gutters', span: 6, startRow: 2 }
   ```
   > Update all subsequent `startRow` values accordingly.
5. Add to `GRID_SIZES` if you want it in the grid tab preview.

---

## Adding a new tab

1. Add the tab key to the type annotation:
   ```js
   let tab = $state(/** @type {'grid'|'type'|'guide'|'mynewtab'} */ ('grid'));
   ```
2. Add a button to the toolbar tabs group.
3. Add a `{#if tab === 'mynewtab'}` block after the guide tab.
4. The measurement layer must exist in your tab or be inherited — add:
   ```svelte
   <div class="grid-layer" style={gridStyle} aria-hidden="true">
     <div class="measure" bind:clientWidth={colWidth} bind:clientHeight={rowHeight}></div>
   </div>
   ```

---

## Caveats

### `rowHeight` is 0 on first render (SSR)
`rowHeight` comes from `bind:clientHeight`, which is 0 during SSR. All derived type sizes will be `0` until hydration. This means exported CSS values will be `0rem` if you copy before the client renders. In practice this isn't an issue — the browser renders quickly and the values update immediately. But don't try to read them server-side.

### `rootPx` assumes 16px default
If the user has changed their browser base font size (accessibility setting), `rootPx` reads the real value from `getComputedStyle`. All rem conversions use this real value. However, the type scale is still derived in px from `rowHeight` and then divided by `rootPx` — so it's always accurate.

### Scrubber eats `mouseup` during fast drags
If the user moves the mouse off the window and releases outside the browser, the `mouseup` event may not fire. The scrubber will stay in drag mode. Clicking anywhere on the page triggers `mouseup` on `window` and clears it. Known minor UX quirk.

### `grid-template-rows: repeat(n, 1fr)` in the main grid
`1fr` divides available space equally. This means `rowHeight` is computed, not set — it changes when you resize the window or adjust cols/gutter/margin. That's intentional: the grid is viewport-responsive. If you want a fixed row height, set `rowUnit` in px and use that in `grid-template-rows`.

### `text-box: trim-both cap alphabetic`
Only Chrome 133+ and Safari 18.2+. Firefox doesn't support it yet. The exported CSS includes it as a progressive enhancement — browsers that don't support it will just show slightly more whitespace above/below text.

### The composition in the Grid tab uses proportional positions
`cp` values are derived from `cols` and `rows`. If you set cols to 2, `cp.c1` and `cp.c2` may collapse to the same value. The composition will look odd at very low column counts (< 6). Minimum usable grid for the composition: ~6 cols, ~6 rows.

---

## Tailwind v4 note

The vite plugin is `@tailwindcss/vite`. CSS entry point is `app.css` which starts with `@import "tailwindcss"`. Tailwind's preflight runs before our reset — the explicit `*, *::before, *::after` reset in `app.css` re-asserts our values.

Custom tokens go in `@theme {}` blocks. The exported `tailwindCSS()` output is ready to paste directly into `app.css` or any CSS file imported by Vite.
