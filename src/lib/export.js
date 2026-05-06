/**
 * CSS/Tailwind/SCSS export — reads live from state at call time.
 */
import { state, TYPE_SIZES, COLOR_ROLES } from './state.svelte.js';

// ─── Helpers ─────────────────────────────────────────────────
const r = (/** @type {number} */ n) => state.rfmt(n);

function scaleVars() {
	return TYPE_SIZES.map(({ key, def }) => {
		const v = state.sizeVals[key];
		return `  --${key}: ${r(v)}rem; /* ${def} */`;
	}).join('\n');
}

function perSizeRules() {
	return TYPE_SIZES.map(({ key, label }) => {
		const t = state.typoMap[key];
		return `  .t-${key} { /* ${label} */ font-size: var(--${key}); font-weight: ${t.weight}; letter-spacing: ${r(t.ls)}em; margin-left: ${r(t.ml)}em; }`;
	}).join('\n');
}

/** @param {'light'|'dark'} mode */
function colorVars(mode) {
	const map = /** @type {Record<string,string>} */ (mode === 'light' ? /** @type {any} */ (state.colors.light) : /** @type {any} */ (state.colors.dark));
	return COLOR_ROLES.map(({ key }) => `  --color-${key}: ${map[key]};`).join('\n');
}

// ─── CSS ─────────────────────────────────────────────────────
export function cssGrid() {
	const g = state.grid;
	return `:root {\n  --cols: ${g.cols};\n  --rows: ${g.rows};\n  --gutter: ${g.gutter}rem;\n  --margin: ${g.margin}rem;\n}\n\n.grid {\n  display: grid;\n  grid-template-columns: repeat(var(--cols), 1fr);\n  grid-template-rows:    repeat(var(--rows), 1fr);\n  gap:     var(--gutter);\n  padding: var(--margin);\n}`;
}

export function cssType() {
	return `:root {\n  /* ×n = n rows + (n-1) gutters  ·  ÷n = tx1 ÷ n */\n${scaleVars()}\n}\n\np, h1, h2, h3, h4, h5, h6 {\n  line-height: 1;\n  text-box:    trim-both cap alphabetic;\n}\n\n/* Per-size */\n${perSizeRules()}`;
}

export function cssColors() {
	const indent = (s = '') => s.split('\n').map(l => '  ' + l).join('\n');
	return `/* light */\n:root {\n${colorVars('light')}\n}\n\n/* dark — media query */\n@media (prefers-color-scheme: dark) {\n  :root {\n${indent(colorVars('dark'))}\n  }\n}\n\n/* dark — class */\n[data-theme="dark"] {\n${colorVars('dark')}\n}`;
}

export function cssAll() { return cssGrid() + '\n\n' + cssType() + '\n\n' + cssColors(); }

// ─── Tailwind v4 ─────────────────────────────────────────────
export function tw4Grid() {
	const g = state.grid;
	return `/* Tailwind v4 */\n@theme {\n  --cols: ${g.cols};\n  --rows: ${g.rows};\n  --gutter: ${g.gutter}rem;\n  --margin: ${g.margin}rem;\n}`;
}

export function tw4Type() {
	const lines = TYPE_SIZES.map(({ key }) => `  --font-size-${key}: ${r(state.sizeVals[key])}rem;`).join('\n');
	return `@theme {\n${lines}\n}`;
}

export function tw4Colors() {
	const lines = COLOR_ROLES.map(({ key }) => {
		const lv = /** @type {Record<string,string>} */ (/** @type {any} */ (state.colors.light))[key];
		const dv = /** @type {Record<string,string>} */ (/** @type {any} */ (state.colors.dark))[key];
		return `  --color-${key}: ${lv};\n  --color-${key}-dark: ${dv};`;
	}).join('\n');
	return `@theme {\n${lines}\n}`;
}

export function tw4All() { return tw4Grid() + '\n\n' + tw4Type() + '\n\n' + tw4Colors(); }

// ─── Tailwind v3 ─────────────────────────────────────────────
export function tw3Grid() {
	const g = state.grid;
	return `gridTemplateColumns: { layout: 'repeat(${g.cols}, minmax(0, 1fr))' },\ngridTemplateRows:    { layout: 'repeat(${g.rows}, minmax(0, 1fr))' },\ngap:                 { gutter: '${g.gutter}rem' },\npadding:             { margin: '${g.margin}rem' },`;
}

export function tw3Type() {
	const lines = TYPE_SIZES.map(({ key }) => `  '${key}': ['${r(state.sizeVals[key])}rem', { lineHeight: '1' }],`).join('\n');
	return `fontSize: {\n${lines}\n},`;
}

export function tw3Colors() {
	const lines = COLOR_ROLES.map(({ key }) => {
		const lv = /** @type {Record<string,string>} */ (/** @type {any} */ (state.colors.light))[key];
		const dv = /** @type {Record<string,string>} */ (/** @type {any} */ (state.colors.dark))[key];
		return `  '${key}': { DEFAULT: '${lv}', dark: '${dv}' },`;
	}).join('\n');
	return `colors: {\n${lines}\n},`;
}

export function tw3All() {
	return `// tailwind.config.js\nmodule.exports = {\n  theme: { extend: {\n    ${[tw3Grid(), tw3Type(), tw3Colors()].join('\n    ')}\n  }},\n};`;
}

// ─── SCSS ────────────────────────────────────────────────────
export function scssGrid() {
	const g = state.grid;
	return `// Grid\n$cols:   ${g.cols};\n$rows:   ${g.rows};\n$gutter: ${g.gutter}rem;\n$margin: ${g.margin}rem;`;
}

export function scssType() {
	const lines = TYPE_SIZES.map(({ key }) => `$${key}: ${r(state.sizeVals[key])}rem;`).join('\n');
	return `// Type scale\n${lines}`;
}

export function scssColors() {
	const l = COLOR_ROLES.map(({ key }) => `$color-${key}-light: ${/** @type {Record<string,string>} */(/** @type {any} */(state.colors.light))[key]};`).join('\n');
	const d = COLOR_ROLES.map(({ key }) => `$color-${key}-dark:  ${/** @type {Record<string,string>} */(/** @type {any} */(state.colors.dark))[key]};`).join('\n');
	return `// Colors\n${l}\n\n${d}`;
}

export function scssAll() { return scssGrid() + '\n\n' + scssType() + '\n\n' + scssColors(); }

// ─── Framework router ────────────────────────────────────────
/** @type {Record<string, { grid:()=>string, type:()=>string, colors:()=>string, all:()=>string }>} */
export const EXPORTERS = {
	css:  { grid: cssGrid,  type: cssType,  colors: cssColors,  all: cssAll  },
	tw4:  { grid: tw4Grid,  type: tw4Type,  colors: tw4Colors,  all: tw4All  },
	tw3:  { grid: tw3Grid,  type: tw3Type,  colors: tw3Colors,  all: tw3All  },
	scss: { grid: scssGrid, type: scssType, colors: scssColors, all: scssAll },
};

// ─── Reference docs ──────────────────────────────────────────
export function guideMD() {
	const g = state.grid, d = state.dims;
	const rows = TYPE_SIZES.map(({ key, label, def }) => {
		const v = state.sizeVals[key], t = state.typoMap[key];
		return `| \`--${key}\` | ${label} | ${def} | ${state.rfmt(v)}rem | ${state.topx(v)}px | ${t.weight} | ${state.rfmt(t.ls)} | ${state.rfmt(t.ml)} |`;
	}).join('\n');
	return `# Grid System Guide\n> ${new Date().toLocaleDateString()}\n\n## Grid\n| | |\n|---|---|\n| Cols | ${g.cols} |\n| Rows | ${g.rows} |\n| Gutter | ${g.gutter}rem |\n| Margin | ${g.margin}rem |\n| Col width | ${state.rfmt(d.col/d.rootPx)}rem / ${Math.round(d.col)}px |\n| Row height | ${state.rfmt(d.row/d.rootPx)}rem / ${Math.round(d.row)}px |\n\n## Type Scale\n| Token | Label | Def | rem | px | W | LS | ML |\n|---|---|---|---|---|---|---|---|\n${rows}\n\n## CSS\n\`\`\`css\n${cssAll()}\n\`\`\`\n`;
}

export function guideJSON() {
	const g = state.grid, d = state.dims;
	const scale = Object.fromEntries(TYPE_SIZES.map(({ key, label, def }) => {
		const v = state.sizeVals[key], t = state.typoMap[key];
		return [key, { label, definition: def, rem: parseFloat(state.rfmt(v)), px: state.topx(v), ...t }];
	}));
	return JSON.stringify({
		generated: new Date().toLocaleDateString(),
		grid: { cols: g.cols, rows: g.rows, gutter: `${g.gutter}rem`, margin: `${g.margin}rem`,
			colWidth: { rem: parseFloat(state.rfmt(d.col/d.rootPx)), px: Math.round(d.col) },
			rowHeight: { rem: parseFloat(state.rfmt(d.row/d.rootPx)), px: Math.round(d.row) } },
		typeScale: scale,
		colors: { light: state.colors.light, dark: state.colors.dark },
	}, null, 2);
}
