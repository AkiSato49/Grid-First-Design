/* ═══════════════════════════════════════════
   Grid Tool — shared reactive state (Svelte 5)
   Class pattern: $state fields + getter derivations.
   Reactive reads in getters are tracked by Svelte's
   dependency system when accessed from component templates.
═══════════════════════════════════════════ */

// ── Constants ──────────────────────────────────────────────────
export const TYPE_DEFAULTS = {
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

export const GRID_SIZES = [
	{ key: 'tx2', label: '×2', row: '2/span 2' },
	{ key: 'tx1', label: '×1', row: '4'        },
	{ key: 'td2', label: '÷2', row: '5'        },
	{ key: 'td3', label: '÷3', row: '6'        },
	{ key: 'td4', label: '÷4', row: '7'        },
	{ key: 'td8', label: '÷8', row: '8'        },
];

export const TYPE_SIZES = [
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
export const TYPE_ROWS = 21;

export const COLOR_ROLES = [
	{ key: 'bg',         label: 'Background' },
	{ key: 'surface',    label: 'Surface'    },
	{ key: 'border',     label: 'Border'     },
	{ key: 'text',       label: 'Text'       },
	{ key: 'text-muted', label: 'Text Muted' },
	{ key: 'primary',    label: 'Primary'    },
	{ key: 'secondary',  label: 'Secondary'  },
	{ key: 'accent',     label: 'Accent'     },
];

// ── App state class ─────────────────────────────────────────────
class AppState {
	// ── Grid ─────────────────────────────────────────────────────
	grid = $state({
		cols: 12, rows: 8,
		gutter: 1, margin: 2,
		showCells: true, showCols: false, showRows: false,
	});

	// ── DOM measurements (written by bind: in GridTab) ────────────
	dims = $state({ col: 0, row: 0, rootPx: 16 });

	// ── UI routing ───────────────────────────────────────────────
	ui = $state({
		tab:       /** @type {'grid'|'type'|'colors'|'export'|'guide'} */ ('grid'),
		framework: /** @type {'css'|'tw4'|'tw3'|'scss'} */ ('css'),
		copied:    '',
	});

	// ── Typography ───────────────────────────────────────────────
	typo = $state(structuredClone(TYPE_DEFAULTS));

	// ── Colors ───────────────────────────────────────────────────
	colors = $state({
		mode: /** @type {'light'|'dark'} */ ('light'),
		light: {
			bg: '#ffffff', surface: '#f4f4f5', border: '#e4e4e7',
			text: '#09090b', 'text-muted': '#71717a',
			primary: '#2563eb', secondary: '#7c3aed', accent: '#d97706',
		},
		dark: {
			bg: '#09090b', surface: '#18181b', border: '#27272a',
			text: '#fafafa', 'text-muted': '#a1a1aa',
			primary: '#3b82f6', secondary: '#8b5cf6', accent: '#f59e0b',
		},
	});

	// ── Derived: type scale ───────────────────────────────────────
	get gutterPx() { return this.grid.gutter * this.dims.rootPx; }

	/** @param {number} n @param {number} track */
	spanPx(n, track) { return n * track + (n - 1) * this.gutterPx; }

	get tx1()   { return this.dims.row / this.dims.rootPx; }
	get tx2()   { return this.spanPx(2, this.dims.row) / this.dims.rootPx; }
	get tx3()   { return this.spanPx(3, this.dims.row) / this.dims.rootPx; }
	get tx4()   { return this.spanPx(4, this.dims.row) / this.dims.rootPx; }
	get tx5()   { return this.spanPx(5, this.dims.row) / this.dims.rootPx; }
	get td2()   { return this.tx1 / 2; }
	get td3()   { return this.tx1 / 3; }
	get td4()   { return this.tx1 / 4; }
	get td8()   { return this.tx1 / 8; }

	get sizeVals() {
		return /** @type {Record<string,number>} */ ({
			tx5: this.tx5, tx4: this.tx4, tx3: this.tx3, tx2: this.tx2, tx1: this.tx1,
			td2: this.td2, td3: this.td3, td4: this.td4, td8: this.td8,
		});
	}

	// ── Derived: typed accessors ──────────────────────────────────
	get typoMap() {
		return /** @type {Record<string,{weight:number,ls:number,ml:number}>} */ (/** @type {any} */ (this.typo));
	}

	get activeColors() {
		return /** @type {Record<string,string>} */ (
			this.colors.mode === 'light'
				? /** @type {any} */ (this.colors.light)
				: /** @type {any} */ (this.colors.dark)
		);
	}

	// ── Typography mutations ──────────────────────────────────────
	/** @param {string} key */
	resetTypo(key) {
		const d = /** @type {any} */ (TYPE_DEFAULTS)[key];
		this.typoMap[key].weight = d.weight;
		this.typoMap[key].ls     = d.ls;
		this.typoMap[key].ml     = d.ml;
	}

	// ── Grid layout strings ───────────────────────────────────────
	get gridStyle() {
		return `
			grid-template-columns: repeat(${this.grid.cols}, 1fr);
			grid-template-rows:    repeat(${this.grid.rows}, 1fr);
			gap:                   ${this.grid.gutter}rem;
			padding:               ${this.grid.margin}rem;
		`;
	}

	/** @param {number} n */
	scrollGrid(n) {
		return `
			grid-template-columns: repeat(${this.grid.cols}, 1fr);
			grid-template-rows:    repeat(${n}, ${this.dims.row}px);
			gap:                   ${this.grid.gutter}rem;
			padding:               ${this.grid.margin}rem;
			width: 100%;
		`;
	}

	get typeGridStyle() { return this.scrollGrid(TYPE_ROWS); }

	// ── Composition positions ─────────────────────────────────────
	get cp() {
		const cols = this.grid.cols, rows = this.grid.rows;
		const c1 = Math.max(1, Math.round(cols * 0.20));
		const c2 = Math.max(c1 + 2, Math.round(cols * 0.67));
		const c3 = Math.min(cols, c2 + 1);
		const c4 = Math.min(cols + 1, c3 + 2);
		const r1 = Math.max(1, Math.round(rows * 0.25));
		const r2 = Math.min(rows - 2, r1 + 2);
		const r3 = Math.min(rows - 1, r2 + 2);
		const r4 = Math.min(rows, r3 + 1);
		return { c1, c2, c3, c4, r1, r2, r3, r4 };
	}

	// ── Guide column zones ────────────────────────────────────────
	get gz() {
		const { c1, c2 } = this.cp;
		const cols = this.grid.cols;
		return {
			token: /** @type {[number,number]} */ ([c1,                          Math.min(cols, c1 + 2)]),
			label: /** @type {[number,number]} */ ([Math.min(cols, c1 + 2),      Math.min(cols, c1 + 3)]),
			def:   /** @type {[number,number]} */ ([Math.min(cols, c1 + 3),      c2]),
			rem:   /** @type {[number,number]} */ ([c2,                          Math.min(cols + 1, c2 + 2)]),
			px_:   /** @type {[number,number]} */ ([Math.min(cols, c2 + 2),      Math.min(cols + 1, c2 + 3)]),
			w:     /** @type {[number,number]} */ ([Math.min(cols, c2 + 3),      cols + 1]),
		};
	}

	// ── Helpers ───────────────────────────────────────────────────
	/** @param {number} n */
	rfmt(n) { return parseFloat(n.toFixed(4)).toString(); }

	/** @param {number} n */
	topx(n) { return Math.round(n * this.dims.rootPx); }
}

export const state = new AppState();
