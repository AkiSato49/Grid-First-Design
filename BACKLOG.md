# Grid Tool — Backlog

Feature ideas, organised by theme. Not prioritised — pick what's useful next.

---

## Color Scheme

**What:** A Colors tab (or panel) letting you define a palette tied to the grid system and export it alongside the grid/type tokens.

**Why:** Color is the third pillar of a design system. Right now the tool exports layout and type but not color. A grid-aware color system would let you assign colors to grid zones, preview them live, and export them as CSS custom properties in the same `:root` block.

**Ideas:**
- Named swatches: `bg`, `surface`, `text`, `text-muted`, `primary`, `accent`, `border`
- Input: color picker + hex field per swatch (same pattern as type weight/LS scrubbers)
- Live preview: apply `bg` to canvas background, `text` to composition text — see the actual combination
- Export: `--color-bg: #0c0c0c;` etc. appended to `fontCSS()` or as a separate `colorCSS()` function
- Tailwind v4: `--color-bg`, `--color-primary` etc. in the `@theme` block
- Contrast checker: show WCAG AA/AAA pass/fail for each text-on-background pair
- Dark/light toggle: quickly flip between a dark and light palette variant

**Caveats:**
- Color pickers are `<input type="color">` which returns hex. HSL/OKLCH conversion needed for perceptual palettes.
- Storing two palette variants (dark/light) doubles the state — consider a `palettes: { dark: {...}, light: {...} }` structure from the start.

---

## Multiple Page Frames

**What:** Predefined canvas frame sizes beyond the default viewport — letting you design for specific layout contexts and see how the grid behaves in each.

**Why:** Different page types use different proportions. A horizontal-scroll section is twice (or more) as wide as the viewport. A modal is narrower. Designing in the actual frame dimensions reveals spacing and type issues that a full-viewport preview hides.

**Frames to add:**

| Name | Dimensions | Use case |
|------|-----------|---------|
| `viewport` | 100vw × 100vh | Default — current behaviour |
| `wide ×2` | 200vw × 100vh | Horizontal scroll sections, panoramic layouts |
| `wide ×3` | 300vw × 100vh | Full-page horizontal narratives |
| `tall ×2` | 100vw × 200vh | Long-form pages, editorial scroll |
| `square` | 100vw × 100vw | Social media, og:image |
| `card` | 360px × auto | Mobile card, component-level |
| `modal` | 640px × auto | Dialog / overlay |

**Implementation notes:**
- Frame selector lives in the toolbar (a new scrubber or dropdown between Grid/Type/Guide tabs)
- The grid layer gets `width: {frameWidth}; height: {frameHeight}` instead of `inset: 0`
- The canvas wrapper becomes scrollable in both axes: `overflow: scroll`
- `colWidth` and `rowHeight` recompute from the frame dimensions (the `.measure` div adapts automatically since it's inside the grid)
- For `wide ×2`, the composition `cp` values still work — they're proportional to `cols` not to pixels
- Frame state: `let frame = $state('viewport')` with a map of presets

---

## Useful Components

Grid-aligned UI components to demonstrate the system and use as copy-paste starting points.

### Typography components
- **Display heading** — `×3` or `×4`, full width, optical margin correction applied
- **Section heading** — `×2`, spanning half the grid, with a `÷3` label above
- **Body copy block** — `×1` size but `line-height: 1.5` for reading (override the `line-height: 1` rule), constrained to ~60–70ch
- **Caption / label** — `÷3` or `÷4`, uppercase with wide letter-spacing
- **Pull quote** — `×2`, indented by 2 columns, with a left border accent

### Layout components
- **Hero section** — full-width, `×4` heading, `×1` subheading, spans 6 rows
- **Card grid** — `{cols/3}` col-wide cards, each `4` rows tall, 3-up on desktop
- **Sidebar layout** — 3-col sidebar + 9-col main content using subgrid
- **Feature row** — alternating image/text blocks, each snapping to the row unit
- **Sticky header** — recreates the grid's `padding-inline` with `var(--margin)` since `position: fixed` can't inherit subgrid tracks
- **Full-bleed** — `grid-column: 1 / -1; margin-inline: calc(-1 * var(--margin))` to escape the margin
- **Bleed image** — image that escapes the grid margins but respects columns

### Interaction patterns
- **Horizontal scroll section** — a `wide ×2` frame child that scrolls within the main page flow
- **Reveal on scroll** — elements placed at specific grid rows that animate in when the row enters the viewport
- **Grid-snapped drag** — draggable element that snaps its position to the nearest grid cell

---

## Grid Patterns Reference

Common layout patterns expressed in terms of this grid's variables — ready to drop into any project that uses the exported CSS.

```css
/* Full-width section, 6 rows tall */
.hero {
  grid-column: 1 / -1;
  min-height: calc(var(--grid-row) * 6);
}

/* Content constrained to middle columns (3–10 of 12) */
.content {
  grid-column: 3 / 11;
}

/* Two-column split */
.split-left  { grid-column: 1 / 7; }
.split-right { grid-column: 7 / -1; }

/* Sticky header — mirrors the grid without subgrid */
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: var(--gutter);
  padding-inline: var(--margin);
}

/* Full-bleed escape */
.bleed {
  grid-column: 1 / -1;
  margin-inline: calc(-1 * var(--margin));
}

/* Horizontal scroll child */
.h-scroll-track {
  display: grid;
  grid-template-columns: repeat(var(--cols), 100vw); /* each panel = 1 viewport */
  gap: var(--gutter);
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
}
.h-scroll-panel {
  scroll-snap-align: start;
  min-height: 100vh;
}
```

---

## Other Ideas

- **Breakpoint preview** — add a breakpoint scrubber that scales the grid down and shows how it adapts (e.g. 4-col at 375px)
- **Named zones** — let users label grid areas (Hero, Nav, Sidebar) and export them as `grid-template-areas`
- **Rhythm overlay** — baseline grid (horizontal lines at `line-height` intervals) overlaid on the composition, separate from row lines
- **Font loader** — load a custom font file (woff2) directly into the tool and preview it live without a Google Fonts dependency
- **History / undo** — store last N states in a stack, Ctrl+Z to revert
- **Preset save** — save current grid + type settings as a named preset, restore later (localStorage)
- **Side-by-side compare** — split-screen showing two different grid configs at once
