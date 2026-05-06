# Grid Tool — Session Notes
> Last updated: 2026-05-06. Resume from here.

---

## What this project is

A browser-based design tool for building and exporting a CSS grid system with a
mathematically derived type scale and colour palette. Lives at:

- **Repo:** `git@github.com:AkiSato49/Grid-First-Design.git`
- **Local:** `/home/lawliet/Projects/grid-tool`
- **Dev server:** `npm run dev -- --port 5175`  →  http://localhost:5175
- **Stack:** SvelteKit 2, Svelte 5 (runes), Vite 8, Tailwind v4, plain CSS, Satoshi font

---

## Architecture

```
src/
  app.css                      Global reset + Tailwind import + shared grid CSS
  lib/
    state.svelte.js            Single AppState class — ALL reactive state + computed getters
    scrubber.js                Svelte action: click-drag to scrub numeric values
    export.js                  CSS / Tailwind v4 / v3 / SCSS generation (reads from state)
    components/
      Toolbar.svelte           Tab nav + grid scrubbers + overlay toggles
      GridTab.svelte           Composition + grid overlays + measurement div
      TypeTab.svelte           All 9 type sizes with W/LS/ML scrubbers + reset
      ColorsTab.svelte         8 color roles × light/dark with live preview
      ExportTab.svelte         Framework switcher + 4 code panels + guide doc exports
      GuideTab.svelte          Full reference doc + glossary, all on the grid
  routes/
    +page.svelte               17-line shell — just imports and renders tabs
```

---

## State — `state.svelte.js`

Single exported singleton: `export const state = new AppState()`

**IMPORTANT:** Svelte 5 does not allow exporting `$derived` from `.svelte.js` modules.
Solution: class with `$state` fields + **getter methods** for derived values.
Getters re-read reactive state on every access — Svelte tracks dependencies when
accessed in component templates.

```js
// Access pattern in all components:
import { state } from '$lib/state.svelte.js';
state.grid.cols         // $state field
state.tx1               // getter — derived from dims.row
state.sizeVals          // getter — returns { tx5..td8 } record
state.cp                // getter — proportional composition positions
state.gridStyle         // getter — CSS string for grid layers
state.scrollGrid(n)     // method — explicit-px scrollable grid CSS
```

**Key fields:**
| Field | Type | Notes |
|-------|------|-------|
| `state.grid` | `$state({cols,rows,gutter,margin,showCells,showCols,showRows})` | Grid settings |
| `state.dims` | `$state({col,row,rootPx})` | DOM-measured. `row`/`col` written by `bind:clientWidth/Height` in GridTab |
| `state.ui` | `$state({tab,framework,copied})` | Routing + export UI |
| `state.typo` | `$state(structuredClone(TYPE_DEFAULTS))` | Per-size {weight,ls,ml} |
| `state.colors` | `$state({mode,light:{...},dark:{...}})` | 8 color roles × 2 modes |

**Type scale naming convention (×/÷):**
- `tx1` = 1 row (base unit)
- `tx2` = 2 rows + 1 gutter, `tx3` = 3 rows + 2 gutters … up to `tx5`
- `td2` = ½ row, `td3` = ⅓, `td4` = ¼, `td8` = ⅛

All with `line-height: 1` so element height = font-size = row span.

---

## Critical CSS rules (app.css)

```css
/* Grid layers: top-left alignment by default */
.grid-layer  { align-items: start; justify-items: start; }
.scroll-grid { align-items: start; justify-items: start; }

/* Measure div MUST stretch — it's the source of dims.row/col */
.measure { visibility: hidden; align-self: stretch; justify-self: stretch; }

/* Text elements need justify-self: stretch for ellipsis/wrap to work */
.demo { white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        pointer-events: none; justify-self: stretch; }
.comp { white-space: normal;  overflow: visible;
        pointer-events: none; justify-self: stretch; }

/* Prevent content from stretching grid tracks */
.grid-layer * { min-width: 0; min-height: 0; overflow: visible; }
```

---

## Tab details

### Grid tab
- `GridTab.svelte` — hosts the measurement div (`bind:clientWidth={state.dims.col}` etc.)
- Shows a typographic composition with 5 elements placed at proportional grid positions (`state.cp`)
- Positions scale with cols/rows via `cp.c1..c4, r1..r4`

### Type tab
- Scrollable canvas (`scroll-canvas` + `scroll-grid`)
- 9 sizes in `TYPE_SIZES`, each with `startRow` + `span` already calculated
- Each size occupies exactly `span` rows (the font-size height matches the row span)
- W / LS / ML scrubbers per size, reset button restores `TYPE_DEFAULTS`

### Colors tab
- 8 roles: bg, surface, border, text, text-muted, primary, secondary, accent
- Light + dark mode — toggle switches `state.colors.mode`
- Layout: `label | picker+hex+color-block` for light | same for dark
- Color block: `align-self: stretch` → full row height, `flex: 1` → fills remaining width
- Bottom: live preview strip showing active palette

### Export tab
- Framework switcher: CSS / Tailwind v4 / Tailwind v3 / SCSS
- 4 code panels: Grid | Type | Colors | All (side-by-side in grid cols)
- Each panel: copy button + `<pre>` code block filling allocated rows
- Reference doc exports: `.md` (human guide) + `.json` (agent tokens)
- All export functions in `export.js` read live from `state` at call time

### Guide tab
- 34-row scrollable grid
- All text at `td4` size via `--gs` CSS var on the grid container
- Intro text → Grid dims → Type scale table → Glossary (14 terms)
- Self-describing: laid out on the grid it describes

---

## Known patterns / gotchas

1. **Measurement div** — must live in every tab (wrapped in `{#if tab === 'x'}`)
   because `bind:clientWidth/Height` only works when the element is in the DOM.
   Currently each tab component includes its own measurement layer.

2. **`scrollGrid(n)`** — method on `state`, called inside `$derived(...)` in components:
   ```js
   let myStyle = $derived(state.scrollGrid(ROWS));
   ```
   Svelte tracks the reactive reads inside the method call.

3. **`$derived` at module scope** — NOT supported by Svelte 5 for exports.
   Use class getters instead. Getters are NOT memoised — they recompute on every read.
   This is fine for cheap computations; avoid heavy work in getters.

4. **`justify-self: stretch` on text** — needed for `.demo` (ellipsis) and `.comp` (wrap).
   Without it, `justify-items: start` makes text elements collapse to content width.

5. **Color access** — `state.colors.light` is typed as an object with known keys.
   For dynamic key access cast: `/** @type {Record<string,string>} */ (state.colors.light)`

6. **Scrubber** — `use:scrub` action from `$lib/scrubber.js`.
   Params: `{ get, set, sensitivity, min, max, step }`.
   Sets body cursor to `ew-resize` during drag, clamps + snaps to step.

---

## Backlog (BACKLOG.md)

In priority order of what was discussed:

1. **Colors** ✅ — done (light/dark, 8 roles, preview strip, exports)
2. **Export tab** ✅ — done (CSS/TW4/TW3/SCSS, all sections, guide docs)
3. **Component extraction** ✅ — done
4. **Multiple page frames** — viewport / ×2 wide / ×3 wide / tall / square / card / modal
5. **Useful components** — hero, card grid, sidebar, full-bleed, sticky header patterns
6. **Breakpoint preview** — scrubber to simulate smaller viewports
7. **Named zones** — label grid areas and export as `grid-template-areas`
8. **Preset save** — localStorage, named presets
9. **Font loader** — load custom woff2 directly in tool

---

## Things the user has expressed preferences about

- **Everything grid-based** — all UI and preview content must use the actual CSS grid,
  not arbitrary layouts
- **No boxes** — type displayed as text on bg, not wrapped in colored containers
  (unless it's the Colors tab preview)
- **Scrollable tabs** — type/colors/export/guide use `scroll-canvas` + explicit `px` rows
  so row dimensions stay consistent while scrolling
- **`×` / `÷` notation** — the type scale naming must stay as `tx1..tx5` / `td2..td8`
  internally, displayed as `×1` / `÷2` etc.
- **Satoshi** — default font, variable, loaded from `/static/fonts/satoshi/`
- **Dark background** — `#0c0c0c` body, white text
- **Optical margin** — `margin-left: -0.05em` (scaled per size) for cap-height alignment
- **Top-left alignment** — `align-items: start; justify-items: start` on all grids

---

## Dev commands

```bash
cd /home/lawliet/Projects/grid-tool
npm run dev -- --port 5175   # start dev server
npm run check                 # type check
git add -A && git commit -m "..." && git push
```
