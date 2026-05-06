<script>
	// ── Grid state ────────────────────────────────
	let cols   = $state(12);
	let rows   = $state(8);
	let gutter = $state(1);
	let margin = $state(2);

	let showCells = $state(true);
	let showCols  = $state(false);
	let showRows  = $state(false);

	let tab = $state(/** @type {'grid'|'type'|'guide'} */ ('grid'));

	// ── Measurements ─────────────────────────────
	let colWidth  = $state(0);
	let rowHeight = $state(0);

	let rootPx = $state(16);
	$effect(() => {
		rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
	});

	let gutterPx = $derived(gutter * rootPx);

	/** @param {number} n @param {number} track */
	const spanPx = (n, track) => n * track + (n - 1) * gutterPx;

	// ── Type scale ────────────────────────────────
	let tx1 = $derived(rowHeight / rootPx);
	let tx2 = $derived(spanPx(2, rowHeight) / rootPx);
	let tx3 = $derived(spanPx(3, rowHeight) / rootPx);
	let tx4 = $derived(spanPx(4, rowHeight) / rootPx);
	let tx5 = $derived(spanPx(5, rowHeight) / rootPx);
	let td2 = $derived(tx1 / 2);
	let td3 = $derived(tx1 / 3);
	let td4 = $derived(tx1 / 4);
	let td8 = $derived(tx1 / 8);

	let sizeVals = $derived(/** @type {Record<string,number>} */ ({ tx5, tx4, tx3, tx2, tx1, td2, td3, td4, td8 }));

	// ── Per-size typography ───────────────────────
	const DEFAULTS = {
		tx5: { weight: 400, ls: 0, ml: -0.09  },
		tx4: { weight: 400, ls: 0, ml: -0.09  },
		tx3: { weight: 400, ls: 0, ml: -0.09  },
		tx2: { weight: 400, ls: 0, ml: -0.09  },
		tx1: { weight: 400, ls: 0, ml: -0.075 },
		td2: { weight: 400, ls: 0, ml: -0.06  },
		td3: { weight: 400, ls: 0, ml: -0.05  },
		td4: { weight: 400, ls: 0, ml: -0.05  },
		td8: { weight: 400, ls: 0, ml: -0.05  },
	};

	let typo      = $state(structuredClone(DEFAULTS));
	const typoMap = /** @type {Record<string, typeof DEFAULTS.tx1>} */ (/** @type {any} */ (typo));
	const defsMap = /** @type {Record<string, typeof DEFAULTS.tx1>} */ (/** @type {any} */ (DEFAULTS));

	/** @param {string} key */
	function resetTypo(key) {
		const d = defsMap[key];
		typoMap[key].weight = d.weight;
		typoMap[key].ls     = d.ls;
		typoMap[key].ml     = d.ml;
	}

	// ── Composition positions (proportional, clamp to grid bounds) ──
	let cp = $derived((() => {
		const c1 = Math.max(1, Math.round(cols * 0.20));          // ~col 3 of 12
		const c2 = Math.max(c1 + 2, Math.round(cols * 0.67));     // ~col 8 of 12
		const c3 = Math.min(cols, c2 + 1);                        // ~col 9
		const c4 = Math.min(cols + 1, c3 + 2);                    // ~col 11
		const r1 = Math.max(1, Math.round(rows * 0.25));           // ~row 2 of 8
		const r2 = Math.min(rows - 2, r1 + 2);                    // ~row 4
		const r3 = Math.min(rows - 1, r2 + 2);                    // ~row 6
		const r4 = Math.min(rows,     r3 + 1);                    // ~row 7
		return { c1, c2, c3, c4, r1, r2, r3, r4 };
	})());

	const GRID_SIZES = [
		{ key: 'tx2', label: '×2', row: '2/span 2' },
		{ key: 'tx1', label: '×1', row: '4'        },
		{ key: 'td2', label: '÷2', row: '5'        },
		{ key: 'td3', label: '÷3', row: '6'        },
		{ key: 'td4', label: '÷4', row: '7'        },
		{ key: 'td8', label: '÷8', row: '8'        },
	];

	const TYPE_SIZES = [
		{ key: 'tx5', label: '×5', def: '5 rows + 4 gutters', span: 5, startRow: 2  },
		{ key: 'tx4', label: '×4', def: '4 rows + 3 gutters', span: 4, startRow: 7  },
		{ key: 'tx3', label: '×3', def: '3 rows + 2 gutters', span: 3, startRow: 11 },
		{ key: 'tx2', label: '×2', def: '2 rows + 1 gutter',  span: 2, startRow: 14 },
		{ key: 'tx1', label: '×1', def: '1 row (base unit)',   span: 1, startRow: 16 },
		{ key: 'td2', label: '÷2', def: '½ row',              span: 1, startRow: 17 },
		{ key: 'td3', label: '÷3', def: '⅓ row',              span: 1, startRow: 18 },
		{ key: 'td4', label: '÷4', def: '¼ row',              span: 1, startRow: 19 },
		{ key: 'td8', label: '÷8', def: '⅛ row',              span: 1, startRow: 20 },
	];
	const TYPE_ROWS = 21;

	// ── Grid styles ───────────────────────────────
	let gridStyle = $derived(`
		grid-template-columns: repeat(${cols}, 1fr);
		grid-template-rows:    repeat(${rows}, 1fr);
		gap:                   ${gutter}rem;
		padding:               ${margin}rem;
	`);

	/** @param {number} n */
	const scrollGrid = (n) => `
		grid-template-columns: repeat(${cols}, 1fr);
		grid-template-rows:    repeat(${n}, ${rowHeight}px);
		gap:                   ${gutter}rem;
		padding:               ${margin}rem;
		width:                 100%;
	`;

	let typeGridStyle = $derived(scrollGrid(TYPE_ROWS));

	// Guide layout:
	// 1 title | 1 gap | 2 intro | 1 grid-hd | 2 grid-data | 1 type-hd | 1 col-heads | 9 type | 1 glossary-hd | 14 glossary
	const GUIDE_ROWS = 34;
	let guideGridStyle = $derived(scrollGrid(GUIDE_ROWS));

	// Column zones for guide layout (derived from cp)
	let gz = $derived({
		token: /** @type {[number,number]} */ ([cp.c1, Math.min(cols, cp.c1 + 2)]),
		label: /** @type {[number,number]} */ ([Math.min(cols, cp.c1 + 2), Math.min(cols, cp.c1 + 3)]),
		def:   /** @type {[number,number]} */ ([Math.min(cols, cp.c1 + 3), cp.c2]),
		rem:   /** @type {[number,number]} */ ([cp.c2, Math.min(cols + 1, cp.c2 + 2)]),
		px:    /** @type {[number,number]} */ ([Math.min(cols, cp.c2 + 2), Math.min(cols + 1, cp.c2 + 3)]),
		w:     /** @type {[number,number]} */ ([Math.min(cols, cp.c2 + 3), cols + 1]),
	});

	// ── Scrubber ──────────────────────────────────
	/**
	 * @param {HTMLElement} node
	 * @param {{ get: () => number, set: (v: number) => void, sensitivity: number, min: number, max: number, step: number }} opts
	 */
	function scrub(node, opts) {
		let startX = 0, startVal = 0;
		function onDown(/** @type {MouseEvent} */ e) {
			startX = e.clientX; startVal = opts.get();
			document.body.style.cursor = 'ew-resize';
			document.body.style.userSelect = 'none';
			window.addEventListener('mousemove', onMove);
			window.addEventListener('mouseup', onUp);
			e.preventDefault();
		}
		function onMove(/** @type {MouseEvent} */ e) {
			const raw = startVal + (e.clientX - startX) * opts.sensitivity;
			const stepped = Math.round(raw / opts.step) * opts.step;
			opts.set(parseFloat(Math.min(opts.max, Math.max(opts.min, stepped)).toFixed(4)));
		}
		function onUp() {
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		}
		node.addEventListener('mousedown', onDown);
		return { destroy() { node.removeEventListener('mousedown', onDown); } };
	}

	// ── Helpers ───────────────────────────────────
	const r  = (/** @type {number} */ n) => parseFloat(n.toFixed(4)).toString();
	const px = (/** @type {number} */ n) => Math.round(n * rootPx);

	// ── CSS exports ───────────────────────────────
	function gridCSS() {
		return `:root {
  --cols:   ${cols};
  --rows:   ${rows};
  --gutter: ${gutter}rem;
  --margin: ${margin}rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  grid-template-rows:    repeat(var(--rows), 1fr);
  gap:     var(--gutter);
  padding: var(--margin);
}`;
	}

	function fontCSS() {
		const perSize = TYPE_SIZES.map(({ key, label }) => {
			const t = typoMap[key];
			return `  .t-${key} { /* ${label} */ font-size: var(--${key}); font-weight: ${t.weight}; letter-spacing: ${r(t.ls)}em; margin-left: ${r(t.ml)}em; }`;
		}).join('\n');
		return `:root {
  /* ×n = n rows + (n-1) gutters,  ÷n = 1 row / n */
  --tx1: ${r(tx1)}rem; /* ×1 — 1 row                  */
  --tx2: ${r(tx2)}rem; /* ×2 — 2 rows + 1 gutter      */
  --tx3: ${r(tx3)}rem; /* ×3 — 3 rows + 2 gutters     */
  --tx4: ${r(tx4)}rem; /* ×4 — 4 rows + 3 gutters     */
  --tx5: ${r(tx5)}rem; /* ×5 — 5 rows + 4 gutters     */
  --td2: ${r(td2)}rem; /* ÷2 — ½ row                  */
  --td3: ${r(td3)}rem; /* ÷3 — ⅓ row                  */
  --td4: ${r(td4)}rem; /* ÷4 — ¼ row                  */
  --td8: ${r(td8)}rem; /* ÷8 — ⅛ row                  */
}

p, h1, h2, h3, h4, h5, h6 {
  line-height: 1;
  text-box:    trim-both cap alphabetic;
}

/* Per-size */
${perSize}`;
	}

	function tailwindCSS() {
		return `/* Tailwind v4 */
@theme {
  --cols: ${cols}; --rows: ${rows};
  --gutter: ${gutter}rem; --margin: ${margin}rem;
  --font-size-tx1: ${r(tx1)}rem;
  --font-size-tx2: ${r(tx2)}rem;
  --font-size-tx3: ${r(tx3)}rem;
  --font-size-tx4: ${r(tx4)}rem;
  --font-size-tx5: ${r(tx5)}rem;
  --font-size-td2: ${r(td2)}rem;
  --font-size-td3: ${r(td3)}rem;
  --font-size-td4: ${r(td4)}rem;
  --font-size-td8: ${r(td8)}rem;
}`;
	}

	// ── Guide exports ─────────────────────────────
	function guideMD() {
		const scaleRows = TYPE_SIZES.map(({ key, label, def }) => {
			const sz = sizeVals[key];
			const t  = typoMap[key];
			return `| \`--${key}\` | ${label} | ${def} | ${r(sz)}rem | ${px(sz)}px | ${t.weight} | ${r(t.ls)}em | ${r(t.ml)}em |`;
		}).join('\n');

		const spanRows = [2,3,4,5,6].map(n => {
			const w = spanPx(n, colWidth);
			return `| ${n} cols | ${r(w / rootPx)}rem | ${Math.round(w)}px |`;
		}).join('\n');

		const rowSpanRows = [2,3,4,5].map(n => {
			const h = spanPx(n, rowHeight);
			return `| ${n} rows | ${r(h / rootPx)}rem | ${Math.round(h)}px |`;
		}).join('\n');

		return `# Grid System Guide
> Generated ${new Date().toLocaleDateString('en-AU')}

## Philosophy
All type sizes are derived from the grid row height — nothing is arbitrary.
A font with \`line-height: 1\` fills its row span exactly.
Notation: \`×n\` multiplies the row unit, \`÷n\` divides it.

---

## Grid
| Property | Value |
|----------|-------|
| Columns  | ${cols} |
| Rows     | ${rows} |
| Gutter   | ${gutter}rem |
| Margin   | ${margin}rem |
| Col width  | ${r(colWidth / rootPx)}rem / ${Math.round(colWidth)}px |
| Row height | ${r(rowHeight / rootPx)}rem / ${Math.round(rowHeight)}px |

### Column spans
| Span | rem | px |
|------|-----|----|
| 1 col | ${r(colWidth / rootPx)}rem | ${Math.round(colWidth)}px |
${spanRows}

### Row spans
| Span | rem | px |
|------|-----|----|
| 1 row | ${r(rowHeight / rootPx)}rem | ${Math.round(rowHeight)}px |
${rowSpanRows}

---

## Type Scale
| Token | Label | Definition | rem | px | Weight | LS | ML |
|-------|-------|------------|-----|----|--------|----|----|
${scaleRows}

---

## CSS Variables
\`\`\`css
${fontCSS()}
\`\`\`

## Grid CSS
\`\`\`css
${gridCSS()}
\`\`\`

---

## Usage Examples
\`\`\`css
/* Heading that fills exactly 2 rows */
.headline { font-size: var(--tx2); line-height: 1; }

/* Body text at ×1 (1 full row cap-height) */
.body { font-size: var(--tx1); line-height: 1; }

/* Caption at ÷2 */
.caption { font-size: var(--td2); line-height: 1; }

/* Section spanning 3 rows */
.section { min-height: calc(var(--grid-row) * 3); }
\`\`\`

---

## Agent Notes
- All tokens share \`line-height: 1\` so element height = font-size
- \`--tx1\` is the base unit; all other sizes scale from it
- Gutter is included in multi-row sizes (\`--tx2\` = 2×rowHeight + 1×gutter)
- \`text-box: trim-both cap alphabetic\` trims ascender/descender whitespace (Chrome 133+, Safari 18.2+)
- Optical margin correction (\`margin-left\` in em) compensates for font sidebearing
`;
	}

	function guideJSON() {
		const scale = Object.fromEntries(
			TYPE_SIZES.map(({ key, label, def }) => {
				const sz = sizeVals[key];
				const t  = typoMap[key];
				return [key, {
					label, definition: def,
					rem: parseFloat(r(sz)),
					px: px(sz),
					weight: t.weight,
					letterSpacing: t.ls,
					marginLeft: t.ml,
				}];
			})
		);

		return JSON.stringify({
			generated: new Date().toLocaleDateString('en-AU'),
			system: 'grid-derived type scale — ×n multiplies row unit, ÷n divides it',
			grid: {
				cols, rows,
				gutter: `${gutter}rem`,
				margin: `${margin}rem`,
				colWidth:  { rem: parseFloat(r(colWidth / rootPx)),  px: Math.round(colWidth)  },
				rowHeight: { rem: parseFloat(r(rowHeight / rootPx)), px: Math.round(rowHeight) },
			},
			typeScale: scale,
			usage: {
				lineHeight: 1,
				textBox: 'trim-both cap alphabetic',
				note: 'element height = font-size when line-height is 1',
			},
		}, null, 2);
	}

	// ── Copy state ────────────────────────────────
	let copied  = $state('');
	let preview = $state('');

	/** @param {string} what */
	async function copy(what) {
		/** @type {Record<string,string>} */
		const map = {
			grid: gridCSS(),
			font: fontCSS(),
			tw:   tailwindCSS(),
			all:  gridCSS() + '\n\n' + fontCSS() + '\n\n' + tailwindCSS(),
			md:   guideMD(),
			json: guideJSON(),
		};
		await navigator.clipboard.writeText(map[what] ?? '');
		copied = what;
		setTimeout(() => { copied = ''; }, 1500);
	}

	/** @type {Record<string, () => string>} */
	const previewMap = {
		grid: gridCSS, font: fontCSS,
		tw: tailwindCSS, all: () => gridCSS() + '\n\n' + fontCSS(),
		md: guideMD, json: guideJSON,
	};
</script>

<!-- ══ TOOLBAR ════════════════════════════════ -->
<div class="toolbar">

	<div class="tabs">
		<button class="tab-btn" class:active={tab==='grid'}  onclick={() => tab='grid'}>Grid</button>
		<button class="tab-btn" class:active={tab==='type'}  onclick={() => tab='type'}>Type</button>
		<button class="tab-btn" class:active={tab==='guide'} onclick={() => tab='guide'}>Guide</button>
	</div>

	<div class="sep"></div>

	<div class="group">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="scrubber" use:scrub={{ get: () => cols,   set: v => cols   = v, sensitivity: 0.15, min: 1, max: 48, step: 1    }}>cols <b>{cols}</b></span>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="scrubber" use:scrub={{ get: () => rows,   set: v => rows   = v, sensitivity: 0.15, min: 1, max: 48, step: 1    }}>rows <b>{rows}</b></span>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="scrubber" use:scrub={{ get: () => gutter, set: v => gutter = v, sensitivity: 0.01, min: 0, max: 10, step: 0.25 }}>gutter <b>{gutter}rem</b></span>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="scrubber" use:scrub={{ get: () => margin, set: v => margin = v, sensitivity: 0.01, min: 0, max: 20, step: 0.25 }}>margin <b>{margin}rem</b></span>
	</div>

	<div class="sep"></div>

	<div class="group">
		<label class="toggle"><input type="checkbox" bind:checked={showCells}/><span>cells</span></label>
		<label class="toggle"><input type="checkbox" bind:checked={showCols} /><span>cols</span></label>
		<label class="toggle"><input type="checkbox" bind:checked={showRows} /><span>rows</span></label>
	</div>

	<div class="sep"></div>

	<!-- CSS copies -->
	<div class="group">
		{#each [['grid','copy grid'],['font','copy font'],['tw','copy ⚡tw'],['all','copy all']] as [key, label]}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="copy-wrap" onmouseenter={() => preview=key} onmouseleave={() => preview=''}>
				<button class="copy-btn" class:done={copied===key} class:tw={key==='tw'} onclick={() => copy(key)}>
					{copied===key ? '✓' : label}
				</button>
				{#if preview===key}
					<div class="preview-pop">
						<div class="preview-label">{label}</div>
						<pre class="preview-code">{previewMap[key]?.()}</pre>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="sep"></div>

	<!-- Guide copies -->
	<div class="group">
		{#each [['md','copy guide md'],['json','copy guide json']] as [key, label]}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="copy-wrap" onmouseenter={() => preview=key} onmouseleave={() => preview=''}>
				<button class="copy-btn guide-btn" class:done={copied===key} onclick={() => copy(key)}>
					{copied===key ? '✓' : label}
				</button>
				{#if preview===key}
					<div class="preview-pop">
						<div class="preview-label">{label}</div>
						<pre class="preview-code">{previewMap[key]?.().slice(0,600)}...</pre>
					</div>
				{/if}
			</div>
		{/each}
	</div>

</div>

<!-- ══ GRID TAB ══════════════════════════════ -->
{#if tab === 'grid'}

	<div class="grid-layer" style={gridStyle} aria-hidden="true">
		<div class="measure" bind:clientWidth={colWidth} bind:clientHeight={rowHeight}></div>
	</div>

	{#if showCells}
	<div class="grid-layer" style={gridStyle}>
		{#each Array(cols * rows) as _}<div class="cell"></div>{/each}
	</div>
	{/if}
	{#if showCols}
	<div class="grid-layer" style={gridStyle}>
		{#each Array(cols) as _,i}<div class="col-guide" style="grid-column:{i+1};grid-row:1/-1;"></div>{/each}
	</div>
	{/if}
	{#if showRows}
	<div class="grid-layer" style={gridStyle}>
		{#each Array(rows) as _,i}<div class="row-guide" style="grid-row:{i+1};grid-column:1/-1;"></div>{/each}
	</div>
	{/if}

	<div class="grid-layer content" style={gridStyle}>

		<!-- Title: ×2, col cp.c1→end, rows cp.r1 span 2 -->
		<p class="comp" style="grid-column:{cp.c1}/-1; grid-row:{cp.r1}/span 2; font-size:{tx2}rem; font-weight:{typoMap.tx2.weight}; letter-spacing:{typoMap.tx2.ls}em; margin-left:{typoMap.tx2.ml}em; line-height:1;">
			The Grid
		</p>

		<!-- Subtitle: ×1, col cp.c1→cp.c2, rows cp.r2 span 2 -->
		<p class="comp" style="grid-column:{cp.c1}/{cp.c2}; grid-row:{cp.r2}/span 2; font-size:{tx1}rem; font-weight:{typoMap.tx1.weight}; letter-spacing:{typoMap.tx1.ls}em; margin-left:{typoMap.tx1.ml}em; line-height:1;">
			How it organizes us
		</p>

		<!-- ×2 block: ÷2, col cp.c3→cp.c4, rows cp.r2 span 2 -->
		<p class="comp" style="grid-column:{cp.c3}/{cp.c4}; grid-row:{cp.r2}/span 2; font-size:{td2}rem; font-weight:{typoMap.td2.weight}; letter-spacing:{typoMap.td2.ls}em; margin-left:{typoMap.td2.ml}em; line-height:1;">
			Structure is the silence between the notes
		</p>

		<!-- ÷4 row 1: col cp.c1→end, row cp.r3 -->
		<p class="comp" style="grid-column:{cp.c1}/-1; grid-row:{cp.r3}; font-size:{td4}rem; font-weight:{typoMap.td4.weight}; letter-spacing:{typoMap.td4.ls}em; margin-left:{typoMap.td4.ml}em; line-height:1;">
			The grid is not a constraint — it is a language shared between those who make things
		</p>

		<!-- ÷4 row 2: col cp.c1→end, row cp.r4 -->
		<p class="comp" style="grid-column:{cp.c1}/-1; grid-row:{cp.r4}; font-size:{td4}rem; font-weight:{typoMap.td4.weight}; letter-spacing:{typoMap.td4.ls}em; margin-left:{typoMap.td4.ml}em; line-height:1;">
			Twelve columns. Eight rows. One system. Infinite compositions.
		</p>

	</div>

{/if}

<!-- ══ TYPE TAB ═══════════════════════════════ -->
{#if tab === 'type'}

	<div class="grid-layer" style={gridStyle} aria-hidden="true">
		<div class="measure" bind:clientWidth={colWidth} bind:clientHeight={rowHeight}></div>
	</div>

	<div class="type-canvas">
		<div class="type-grid" style={typeGridStyle}>

			{#if showCols}
				{#each Array(cols) as _,i}
					<div class="col-guide" style="grid-column:{i+1};grid-row:1/-1;"></div>
				{/each}
			{/if}
			{#if showRows}
				{#each Array(TYPE_ROWS) as _,i}
					<div class="row-guide" style="grid-row:{i+1};grid-column:1/-1;"></div>
				{/each}
			{/if}

			{#each TYPE_SIZES as { key, label, span, startRow }}
				{@const t   = typoMap[key]}
				{@const sz  = sizeVals[key]}
				{@const row = `${startRow}/span ${span}`}

				<div class="type-ctrl" style="grid-column:1/3;grid-row:{row};">
					<div class="ctrl-head">
						<span class="ctrl-name">{label}</span>
						<span class="ctrl-val">{r(sz)}rem</span>
						<button class="reset-btn" onclick={() => resetTypo(key)} title="Restore defaults">↺</button>
					</div>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span class="ctrl-row" use:scrub={{ get: () => t.weight, set: v => t.weight=v, sensitivity: 2,     min: 100,  max: 900, step: 100   }}>
						<span class="ctrl-lbl">W</span><span class="ctrl-num">{t.weight}</span>
					</span>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span class="ctrl-row" use:scrub={{ get: () => t.ls,     set: v => t.ls    =v, sensitivity: 0.001, min: -0.1, max: 0.3, step: 0.001 }}>
						<span class="ctrl-lbl">LS</span><span class="ctrl-num">{r(t.ls)}em</span>
					</span>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span class="ctrl-row" use:scrub={{ get: () => t.ml,     set: v => t.ml    =v, sensitivity: 0.001, min: -0.2, max: 0.1, step: 0.001 }}>
						<span class="ctrl-lbl">ML</span><span class="ctrl-num">{r(t.ml)}em</span>
					</span>
				</div>

				<p class="demo" style="grid-column:3/-1;grid-row:{row};font-size:{sz}rem;font-weight:{t.weight};letter-spacing:{t.ls}em;margin-left:{t.ml}em;line-height:1;">
					The quick brown fox
				</p>
			{/each}

		</div>
	</div>

{/if}

<!-- ══ GUIDE TAB ══════════════════════════════ -->
{#if tab === 'guide'}

	<div class="grid-layer" style={gridStyle} aria-hidden="true">
		<div class="measure" bind:clientWidth={colWidth} bind:clientHeight={rowHeight}></div>
	</div>

	<div class="type-canvas">
		<div class="type-grid" style="{guideGridStyle}; --gs:{td4}rem; --gsml:{typoMap.td4.ml}em;">

			{#if showCols}
				{#each Array(cols) as _,i}<div class="col-guide" style="grid-column:{i+1};grid-row:1/-1;"></div>{/each}
			{/if}
			{#if showRows}
				{#each Array(GUIDE_ROWS) as _,i}<div class="row-guide" style="grid-row:{i+1};grid-column:1/-1;"></div>{/each}
			{/if}

			<!-- Row 1: title -->
			<p class="g-eyebrow" style="grid-column:{cp.c1}/-1; grid-row:1;">GRID SYSTEM GUIDE</p>

			<!-- Row 2: empty breathing row -->

			<!-- Rows 3–4: intro text block -->
			<p class="g-text" style="grid-column:{cp.c1}/{cp.c2}; grid-row:3/span 2;">
				This is a grid-derived design system. Every dimension — layout and type — comes from one number: the row height. Change the grid and everything rescales. Nothing is arbitrary.
			</p>
			<p class="g-text g-muted" style="grid-column:{cp.c2}/-1; grid-row:3/span 2;">
				Type sizes are defined as multiples (×n) or divisions (÷n) of that row. With line-height 1, a ×2 heading occupies exactly 2 rows. The grid and the type speak the same unit.
			</p>

			<!-- Row 5: grid section -->
			<p class="g-section" style="grid-column:{cp.c1}/-1; grid-row:5;">GRID</p>

			<!-- Row 6: grid values -->
			<p class="g-val" style="grid-column:{cp.c1}/{cp.c2}; grid-row:6;">{cols} cols · {rows} rows · {gutter}rem gutter · {margin}rem margin</p>
			<p class="g-val" style="grid-column:{cp.c2}/-1; grid-row:6;">col {r(colWidth/rootPx)}rem / {Math.round(colWidth)}px · row {r(rowHeight/rootPx)}rem / {Math.round(rowHeight)}px</p>

			<!-- Row 7: span reference -->
			<p class="g-dim" style="grid-column:{cp.c1}/{cp.c2}; grid-row:7;">2-row {Math.round(spanPx(2,rowHeight))}px · 3-row {Math.round(spanPx(3,rowHeight))}px · 4-row {Math.round(spanPx(4,rowHeight))}px</p>
			<p class="g-dim" style="grid-column:{cp.c2}/-1; grid-row:7;">2-col {Math.round(spanPx(2,colWidth))}px · 3-col {Math.round(spanPx(3,colWidth))}px · 4-col {Math.round(spanPx(4,colWidth))}px</p>

			<!-- Row 8: type section + col headers -->
			<p class="g-section" style="grid-column:{cp.c1}/{gz.token[1]}; grid-row:8;">TYPE SCALE</p>
			<p class="g-colhead" style="grid-column:{gz.token[1]}/{gz.label[1]}; grid-row:8;">label</p>
			<p class="g-colhead" style="grid-column:{gz.label[1]}/{gz.rem[0]}; grid-row:8;">definition</p>
			<p class="g-colhead" style="grid-column:{gz.rem[0]}/{gz.rem[1]}; grid-row:8;">rem</p>
			<p class="g-colhead" style="grid-column:{gz.px[0]}/{gz.px[1]}; grid-row:8;">px</p>
			<p class="g-colhead" style="grid-column:{gz.w[0]}/-1; grid-row:8;">w · ls · ml</p>

			<!-- Rows 9–17: type scale entries -->
			{#each TYPE_SIZES as { key, label, def }, i}
				{@const sz = sizeVals[key]}
				{@const t  = typoMap[key]}
				{@const row = i + 9}
				<p class="g-token" style="grid-column:{cp.c1}/{gz.token[1]};    grid-row:{row};">--{key}</p>
				<p class="g-val"   style="grid-column:{gz.token[1]}/{gz.label[1]}; grid-row:{row};">{label}</p>
				<p class="g-dim"   style="grid-column:{gz.label[1]}/{gz.rem[0]};   grid-row:{row};">{def}</p>
				<p class="g-val"   style="grid-column:{gz.rem[0]}/{gz.rem[1]};     grid-row:{row};">{r(sz)}</p>
				<p class="g-dim"   style="grid-column:{gz.px[0]}/{gz.px[1]};       grid-row:{row};">{px(sz)}</p>
				<p class="g-dim"   style="grid-column:{gz.w[0]}/-1;               grid-row:{row};">{t.weight} · {r(t.ls)} · {r(t.ml)}</p>
			{/each}

			<!-- Row 18: glossary section -->
			<p class="g-section" style="grid-column:{cp.c1}/-1; grid-row:18;">GLOSSARY</p>

			<!-- Rows 19–33: glossary entries — term on left, plain-english definition on right -->
			{#each [
				['Row unit',      'The height of one grid row in pixels. The single base measurement the entire system derives from. Change this and every type size and layout dimension updates.'],
				['Gutter',        'The gap between grid columns and rows, set in rem. Included in multi-row type sizes — a ×2 heading spans 2 row-heights plus 1 gutter.'],
				['Margin',        'Horizontal padding from the viewport edge to the grid content area. Creates breathing space on both sides.'],
				['Col / Column',  'One vertical division of the grid. Width = (viewport − 2×margin − (n-1)×gutter) ÷ n columns.'],
				['Span',          'How many grid tracks an element occupies. A span-2 element covers 2 columns (or rows) plus the gutter between them.'],
				['×n (tx)',         'Font size that spans n rows including (n−1) gutters. e.g. ×2 = 2 row-heights + 1 gutter. Element height equals font-size when line-height = 1.'],
				['÷n (td)',         'Font size equal to one row height divided by n. e.g. ÷4 = quarter of a row. Smaller than the base unit.'],
				['rem',           "Root em. Relative to the HTML element's font size (usually 16px). 1rem = 16px. Scales with browser text settings."],
				['line-height 1', "Makes the CSS line box exactly as tall as the font-size. Removes default leading — the element's rendered height equals its font-size exactly."],
				['text-box trim', 'CSS property trimming the whitespace above the cap-height and below the baseline. Makes text align flush with its container edges. Chrome 133+, Safari 18.2+.'],
				['Sidebearing',   'Built-in horizontal spacing on the left and right of each glyph in the font file. Makes text appear slightly indented from its CSS box edge. Corrected with a small negative margin-left.'],
				['W (Weight)',    'Font weight — how thick the strokes are. Ranges 100 (thin) to 900 (black). 400 = regular, 700 = bold.'],
				['LS (Letter-sp.)','Letter spacing (tracking). Positive values spread glyphs apart, negative values tighten them. Set in em so it scales with font-size.'],
				['ML (Margin-L.)', 'Optical margin correction. Small negative left margin (in em) that pulls text back to visually align the cap-height with the column edge, compensating for sidebearing.'],
			] as [term, def], i}
				{@const row = i + 19}
				<p class="g-gterm" style="grid-column:{cp.c1}/{gz.token[1]};  grid-row:{row};">{term}</p>
				<p class="g-gdef"  style="grid-column:{gz.token[1]}/-1; grid-row:{row};">{def}</p>
			{/each}

		</div>
	</div>

{/if}

<style>
	/* ── Toolbar ── */
	.toolbar {
		position: fixed; top: 1.25rem; left: 50%; translate: -50% 0;
		z-index: 50; display: flex; align-items: center; gap: 0.5rem;
		background: rgba(10,10,10,0.85); backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
		padding: 0.4rem 0.75rem; color: #fff; font-size: 0.7rem;
		white-space: nowrap; box-shadow: 0 4px 24px rgba(0,0,0,0.4);
	}
	.group { display: flex; align-items: center; gap: 0.625rem; }
	.sep   { width: 1px; height: 1rem; background: rgba(255,255,255,0.1); flex-shrink: 0; }

	.tabs { display: flex; gap: 0.25rem; }
	.tab-btn {
		padding: 0.2rem 0.6rem; background: transparent;
		border: 1px solid transparent; border-radius: 5px;
		color: rgba(255,255,255,0.35); font-size: 0.7rem;
		cursor: pointer; font-family: inherit; transition: all 0.12s;
	}
	.tab-btn:hover  { color: rgba(255,255,255,0.7); }
	.tab-btn.active { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); color: #fff; }

	.scrubber {
		display: flex; align-items: center; gap: 0.3rem;
		color: rgba(255,255,255,0.4); cursor: ew-resize;
		padding: 0.25rem 0.1rem; transition: color 0.15s; user-select: none;
	}
	.scrubber:hover { color: rgba(255,255,255,0.7); }
	.scrubber b { color: #fff; font-weight: 500; font-variant-numeric: tabular-nums; }

	.toggle { display: flex; align-items: center; gap: 0.3rem; cursor: pointer; color: rgba(255,255,255,0.35); transition: color 0.15s; }
	.toggle:has(input:checked) { color: rgba(255,255,255,0.85); }
	.toggle input { accent-color: #818cf8; }
	.toggle span  { font-size: 0.7rem; }

	.copy-wrap { position: relative; }
	.copy-btn {
		padding: 0.25rem 0.6rem; background: rgba(255,255,255,0.06);
		border: 1px solid rgba(255,255,255,0.1); border-radius: 5px;
		color: rgba(255,255,255,0.65); font-size: 0.68rem;
		cursor: pointer; transition: all 0.12s; font-family: inherit;
	}
	.copy-btn:hover { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.2); }
	.copy-btn.done  { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.4); color: #4ade80; }
	.copy-btn.tw    { border-color: rgba(56,189,248,0.3); color: rgba(56,189,248,0.8); }
	.copy-btn.tw:hover { background: rgba(56,189,248,0.1); color: #38bdf8; }
	.guide-btn { border-color: rgba(251,191,36,0.3); color: rgba(251,191,36,0.8); }
	.guide-btn:hover { background: rgba(251,191,36,0.1); color: #fbbf24; }

	.preview-pop {
		position: absolute; top: calc(100% + 8px); left: 50%; translate: -50% 0;
		background: #0d0d0d; border: 1px solid rgba(255,255,255,0.1);
		border-radius: 8px; padding: 0.625rem 0.75rem;
		z-index: 100; min-width: 260px; max-height: 260px;
		overflow: hidden; pointer-events: none;
		box-shadow: 0 8px 32px rgba(0,0,0,0.5);
	}
	.preview-label { font-size: 0.6rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem; }
	.preview-code  { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.6rem; line-height: 1.65; color: #a3a3a3; white-space: pre; }

	/* ── Grid layers ── */
	.grid-layer { position: fixed; inset: 0; display: grid; pointer-events: none; }
	.content    { pointer-events: auto; }
	.measure    { visibility: hidden; }
	.cell       { border: 1px solid rgba(99,102,241,0.2); }
	.col-guide  { background: rgba(99,102,241,0.07); border-left: 1px solid rgba(99,102,241,0.3); border-right: 1px solid rgba(99,102,241,0.3); }
	.row-guide  { background: rgba(239,68,68,0.05); border-top: 1px solid rgba(239,68,68,0.25); border-bottom: 1px solid rgba(239,68,68,0.25); }

	/* ── Type tab ── */
	.type-canvas { position: fixed; inset: 0; overflow-y: scroll; overflow-x: hidden; }
	.type-grid   { display: grid; }

	.type-ctrl {
		display: grid; grid-template-columns: 1fr 1fr;
		align-content: center; gap: 0.2rem 0.75rem;
		padding: 0.25rem 0.75rem 0.25rem 0;
		overflow: visible; pointer-events: auto;
	}
	.ctrl-head { grid-column: 1/-1; display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem; }
	.ctrl-name { font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.85); flex: 1; }
	.ctrl-val  { font-size: 0.7rem; font-family: monospace; color: rgba(255,255,255,0.3); }
	.reset-btn {
		background: none; border: 1px solid rgba(255,255,255,0.12); border-radius: 4px;
		color: rgba(255,255,255,0.25); font-size: 0.7rem; padding: 0.1rem 0.3rem;
		cursor: pointer; transition: all 0.12s; line-height: 1;
	}
	.reset-btn:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.35); }
	.ctrl-row { display: flex; align-items: center; gap: 0.4rem; cursor: ew-resize; user-select: none; width: fit-content; }
	.ctrl-row:hover .ctrl-lbl { color: rgba(255,255,255,0.7); }
	.ctrl-row:hover .ctrl-num { color: rgba(255,255,255,0.9); }
	.ctrl-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.3); font-family: monospace; width: 1.6rem; }
	.ctrl-num { font-size: 0.75rem; font-family: monospace; color: rgba(255,255,255,0.65); font-variant-numeric: tabular-nums; }

	/* demo: single-line with ellipsis (type tab) */
	.demo { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }

	/* comp: wraps freely (grid composition) */
	.comp { white-space: normal; overflow: visible; pointer-events: none; }

	/* ── Guide tab ── */
	/* All guide text inherits --gs (font-size) and --gsml (margin-left) from parent grid */
	.g-eyebrow, .g-section, .g-colhead, .g-token, .g-val, .g-dim, .g-text, .g-gterm, .g-gdef {
		font-size: var(--gs);
		line-height: 1;
		margin-left: var(--gsml);
		align-self: start;
		padding-top: 0.15em; /* optical nudge to sit at top of row */
	}
	/* data cells: no wrap, clip */
	.g-eyebrow, .g-section, .g-colhead, .g-token, .g-val, .g-dim {
		white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}
	/* text blocks: wrap freely */
	.g-text, .g-gdef {
		white-space: normal; overflow: visible; line-height: 1.5;
	}
	.g-eyebrow { color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.1em; }
	.g-section { color: rgba(255,255,255,0.2);  text-transform: uppercase; letter-spacing: 0.08em; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 0.4em; }
	.g-colhead { color: rgba(255,255,255,0.15); text-transform: uppercase; letter-spacing: 0.06em; }
	.g-token   { color: rgba(255,255,255,0.55); font-family: monospace; }
	.g-val     { color: rgba(255,255,255,0.7); }
	.g-dim     { color: rgba(255,255,255,0.3); }
	.g-muted   { color: rgba(255,255,255,0.3); }
	.g-text    { color: rgba(255,255,255,0.55); }
	.g-gterm   { color: rgba(255,255,255,0.55); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.g-gdef    { color: rgba(255,255,255,0.3); }




</style>
