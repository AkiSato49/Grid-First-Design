<script>
	import { state, TYPE_SIZES, COLOR_ROLES } from '$lib/state.svelte.js';

	const GUIDE_ROWS = 34;
	let guideGridStyle = $derived(state.scrollGrid(GUIDE_ROWS));
	let r  = (/** @type {number} */ n) => state.rfmt(n);
	let px = (/** @type {number} */ n) => state.topx(n);

	const lightMap = /** @type {Record<string,string>} */ (/** @type {any} */ (state.colors.light));
	const darkMap  = /** @type {Record<string,string>} */ (/** @type {any} */ (state.colors.dark));
</script>

<div class="grid-layer" style={state.gridStyle} aria-hidden="true">
	<div class="measure" bind:clientWidth={state.dims.col} bind:clientHeight={state.dims.row}></div>
</div>

<div class="scroll-canvas">
	<div class="scroll-grid" style="{guideGridStyle}; --gs:{state.td4}rem; --gsml:{state.typoMap.td4.ml}em;">

		{#if state.grid.showCols}
			{#each Array(state.grid.cols) as _,i}<div class="col-guide" style="grid-column:{i+1};grid-row:1/-1;"></div>{/each}
		{/if}
		{#if state.grid.showRows}
			{#each Array(GUIDE_ROWS) as _,i}<div class="row-guide" style="grid-row:{i+1};grid-column:1/-1;"></div>{/each}
		{/if}

		<p class="ge" style="grid-column:{state.cp.c1}/-1; grid-row:1;">GRID SYSTEM GUIDE</p>

		<p class="gt" style="grid-column:{state.cp.c1}/{state.cp.c2}; grid-row:3/span 2;">
			A grid-derived design system. Every dimension — layout and type — comes from the row height. Nothing is arbitrary. Change the grid and everything rescales.
		</p>
		<p class="gt gm" style="grid-column:{state.cp.c2}/-1; grid-row:3/span 2;">
			Sizes are ×n (n rows + gutters) or ÷n (row ÷ n). With line-height 1, a ×2 heading fills exactly 2 rows. Grid and type share one unit.
		</p>

		<p class="gs" style="grid-column:{state.cp.c1}/-1; grid-row:5;">GRID</p>
		<p class="gv" style="grid-column:{state.cp.c1}/{state.cp.c2}; grid-row:6;">{state.grid.cols} cols · {state.grid.rows} rows · {state.grid.gutter}rem gutter · {state.grid.margin}rem margin</p>
		<p class="gv" style="grid-column:{state.cp.c2}/-1; grid-row:6;">col {r(state.dims.col/state.dims.rootPx)}rem / {Math.round(state.dims.col)}px · row {r(state.dims.row/state.dims.rootPx)}rem / {Math.round(state.dims.row)}px</p>
		<p class="gd" style="grid-column:{state.cp.c1}/{state.cp.c2}; grid-row:7;">2-row {Math.round(state.spanPx(2,state.dims.row))}px · 3-row {Math.round(state.spanPx(3,state.dims.row))}px · 4-row {Math.round(state.spanPx(4,state.dims.row))}px</p>
		<p class="gd" style="grid-column:{state.cp.c2}/-1; grid-row:7;">2-col {Math.round(state.spanPx(2,state.dims.col))}px · 3-col {Math.round(state.spanPx(3,state.dims.col))}px</p>

		<p class="gs" style="grid-column:{state.cp.c1}/{state.gz.token[1]}; grid-row:8;">TYPE SCALE</p>
		<p class="gc" style="grid-column:{state.gz.token[1]}/{state.gz.label[1]}; grid-row:8;">label</p>
		<p class="gc" style="grid-column:{state.gz.label[1]}/{state.gz.rem[0]}; grid-row:8;">definition</p>
		<p class="gc" style="grid-column:{state.gz.rem[0]}/{state.gz.rem[1]}; grid-row:8;">rem</p>
		<p class="gc" style="grid-column:{state.gz.px_[0]}/{state.gz.px_[1]}; grid-row:8;">px</p>
		<p class="gc" style="grid-column:{state.gz.w[0]}/-1; grid-row:8;">w · ls · ml</p>

		{#each TYPE_SIZES as { key, label, def }, i}
			{@const sz = state.sizeVals[key]}
			{@const t  = state.typoMap[key]}
			{@const row = i + 9}
			<p class="gk" style="grid-column:{state.cp.c1}/{state.gz.token[1]};    grid-row:{row};">--{key}</p>
			<p class="gv" style="grid-column:{state.gz.token[1]}/{state.gz.label[1]}; grid-row:{row};">{label}</p>
			<p class="gd" style="grid-column:{state.gz.label[1]}/{state.gz.rem[0]};   grid-row:{row};">{def}</p>
			<p class="gv" style="grid-column:{state.gz.rem[0]}/{state.gz.rem[1]};     grid-row:{row};">{r(sz)}</p>
			<p class="gd" style="grid-column:{state.gz.px_[0]}/{state.gz.px_[1]};    grid-row:{row};">{px(sz)}</p>
			<p class="gd" style="grid-column:{state.gz.w[0]}/-1;                     grid-row:{row};">{t.weight} · {r(t.ls)} · {r(t.ml)}</p>
		{/each}

		<p class="gs" style="grid-column:{state.cp.c1}/-1; grid-row:18;">GLOSSARY</p>

		{#each [
			['Row unit',       'Height of one grid row in px — the single base measurement everything derives from.'],
			['Gutter',         'Gap between grid columns and rows in rem. Included in multi-row type sizes.'],
			['Margin',         'Horizontal padding from viewport edge to grid content.'],
			['Col / Column',   'One vertical grid division. Width = (viewport − 2×margin − (n-1)×gutter) ÷ n.'],
			['Span',           'Number of grid tracks an element occupies (includes gutters between them).'],
			['×n (tx)',        'Font size spanning n rows + (n-1) gutters. Height = font-size when line-height: 1.'],
			['÷n (td)',        'Font size = one row ÷ n. Smaller than the base unit.'],
			['rem',            "Root em. Relative to HTML font-size (default 16px)."],
			['line-height: 1', "Line box = font-size exactly. Element height = font-size."],
			['text-box trim',  'Removes whitespace above cap-height and below baseline. Chrome 133+, Safari 18.2+.'],
			['Sidebearing',    'Built-in glyph spacing in font file. Corrected with negative margin-left in em.'],
			['W — Weight',     'Stroke thickness. 100 (thin) → 900 (black). 400 = regular, 700 = bold.'],
			['LS — Letter-sp.', 'Tracking in em. Scales with font-size automatically.'],
			['ML — Margin-L.',  'Optical correction — negative em value aligns cap-height to column edge.'],
		] as [term, def], i}
			{@const row = i + 19}
			<p class="gk" style="grid-column:{state.cp.c1}/{state.gz.token[1]}; grid-row:{row};">{term}</p>
			<p class="gt" style="grid-column:{state.gz.token[1]}/-1;            grid-row:{row};">{def}</p>
		{/each}

	</div>
</div>

<style>
	.ge, .gs, .gc, .gk, .gv, .gd, .gt {
		font-size: var(--gs); line-height: 1;
		margin-left: var(--gsml); align-self: start; padding-top: 0.15em;
	}
	.ge, .gs, .gc, .gk, .gv, .gd {
		white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}
	.gt { white-space: normal; overflow: visible; line-height: 1.5; }
	.ge { color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.1em; }
	.gs { color: rgba(255,255,255,0.2);  text-transform: uppercase; letter-spacing: 0.08em; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 0.4em; }
	.gc { color: rgba(255,255,255,0.15); text-transform: uppercase; letter-spacing: 0.06em; }
	.gk { color: rgba(255,255,255,0.55); font-family: monospace; }
	.gv { color: rgba(255,255,255,0.7); }
	.gd { color: rgba(255,255,255,0.3); }
	.gt { color: rgba(255,255,255,0.4); }
	.gm { color: rgba(255,255,255,0.25); }
</style>
