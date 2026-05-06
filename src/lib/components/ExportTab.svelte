<script>
	import { state } from '$lib/state.svelte.js';
	import { EXPORTERS, guideMD, guideJSON } from '$lib/export.js';

	const EXPORT_ROWS = 16;
	let exportGridStyle = $derived(state.scrollGrid(EXPORT_ROWS));

	const FRAMEWORKS = [
		{ key: 'css',  label: 'CSS'         },
		{ key: 'tw4',  label: 'Tailwind v4'  },
		{ key: 'tw3',  label: 'Tailwind v3'  },
		{ key: 'scss', label: 'SCSS'         },
	];

	/** @param {string} id @param {()=>string} fn */
	async function copy(id, fn) {
		await navigator.clipboard.writeText(fn());
		state.ui.copied = id;
		setTimeout(() => { state.ui.copied = ''; }, 1500);
	}

	/** @param {'grid'|'type'|'colors'|'all'} s */
	function code(s) { return EXPORTERS[state.ui.framework][s](); }
</script>

<div class="grid-layer" style={state.gridStyle} aria-hidden="true">
	<div class="measure" bind:clientWidth={state.dims.col} bind:clientHeight={state.dims.row}></div>
</div>

<div class="scroll-canvas">
	<div class="scroll-grid" style={exportGridStyle}>

		{#if state.grid.showCols}
			{#each Array(state.grid.cols) as _,i}<div class="col-guide" style="grid-column:{i+1};grid-row:1/-1;"></div>{/each}
		{/if}

		<!-- Row 1: title -->
		<p class="ge" style="grid-column:{state.cp.c1}/-1; grid-row:1;">EXPORT</p>

		<!-- Row 2: framework switcher -->
		<div class="fw-switcher" style="grid-column:{state.cp.c1}/-1; grid-row:2;">
			{#each FRAMEWORKS as fw}
				<button class="fw-btn" class:active={state.ui.framework===fw.key} onclick={() => state.ui.framework = /** @type {any} */ (fw.key)}>
					{fw.label}
				</button>
			{/each}
		</div>

		<!-- Row 3: top panel headers -->
		<div class="ph" style="grid-column:{state.cp.c1}/{state.cp.c2}; grid-row:3;">
			<span>Grid</span>
			<button class="cs" class:done={state.ui.copied==='grid-s'} onclick={() => copy('grid-s', () => code('grid'))}>
				{state.ui.copied==='grid-s' ? '✓' : 'copy'}
			</button>
		</div>
		<div class="ph" style="grid-column:{state.cp.c2}/-1; grid-row:3;">
			<span>Type</span>
			<button class="cs" class:done={state.ui.copied==='type-s'} onclick={() => copy('type-s', () => code('type'))}>
				{state.ui.copied==='type-s' ? '✓' : 'copy'}
			</button>
		</div>

		<!-- Rows 4–8: code blocks -->
		<pre class="cb" style="grid-column:{state.cp.c1}/{state.cp.c2}; grid-row:4/span 5;">{code('grid')}</pre>
		<pre class="cb" style="grid-column:{state.cp.c2}/-1;            grid-row:4/span 5;">{code('type')}</pre>

		<!-- Row 9: bottom panel headers -->
		<div class="ph" style="grid-column:{state.cp.c1}/{state.cp.c2}; grid-row:9;">
			<span>Colors</span>
			<button class="cs" class:done={state.ui.copied==='color-s'} onclick={() => copy('color-s', () => code('colors'))}>
				{state.ui.copied==='color-s' ? '✓' : 'copy'}
			</button>
		</div>
		<div class="ph" style="grid-column:{state.cp.c2}/-1; grid-row:9;">
			<span>All</span>
			<button class="cs all" class:done={state.ui.copied==='all-s'} onclick={() => copy('all-s', () => code('all'))}>
				{state.ui.copied==='all-s' ? '✓' : 'copy all'}
			</button>
		</div>

		<!-- Rows 10–14 -->
		<pre class="cb" style="grid-column:{state.cp.c1}/{state.cp.c2}; grid-row:10/span 5;">{code('colors')}</pre>
		<pre class="cb" style="grid-column:{state.cp.c2}/-1;            grid-row:10/span 5;">{code('all')}</pre>

		<!-- Row 15: reference doc exports -->
		<div class="ph" style="grid-column:{state.cp.c1}/-1; grid-row:15;">
			<span class="ge" style="font-size:inherit;">REFERENCE DOCS</span>
			<button class="cs guide" class:done={state.ui.copied==='gmd'}  onclick={() => copy('gmd',  guideMD)}>
				{state.ui.copied==='gmd' ? '✓' : 'copy .md'}
			</button>
			<button class="cs guide" class:done={state.ui.copied==='gjson'} onclick={() => copy('gjson', guideJSON)}>
				{state.ui.copied==='gjson' ? '✓' : 'copy .json'}
			</button>
		</div>

	</div>
</div>

<style>
	.ge { font-size: 0.55rem; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.1em; align-self: center; }

	.fw-switcher { display: flex; gap: 0.3rem; align-items: center; pointer-events: auto; align-self: center; }
	.fw-btn {
		padding: 0.2rem 0.65rem; background: rgba(255,255,255,0.05);
		border: 1px solid rgba(255,255,255,0.1); border-radius: 5px;
		color: rgba(255,255,255,0.4); font-size: 0.7rem; cursor: pointer;
		font-family: inherit; transition: all 0.12s;
	}
	.fw-btn:hover  { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }
	.fw-btn.active { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.2); color: #fff; }

	.ph {
		display: flex; align-items: center; gap: 0.5rem;
		font-size: 0.65rem; color: rgba(255,255,255,0.5);
		pointer-events: auto; align-self: center;
		border-top: 1px solid rgba(255,255,255,0.07); padding-top: 0.4em;
	}
	.ph span { flex: 1; font-weight: 500; }

	.cs {
		padding: 0.15rem 0.5rem; background: rgba(255,255,255,0.07);
		border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;
		color: rgba(255,255,255,0.5); font-size: 0.62rem; cursor: pointer;
		font-family: inherit; transition: all 0.12s;
	}
	.cs:hover { color: #fff; background: rgba(255,255,255,0.12); }
	.cs.done  { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.4); color: #4ade80; }
	.cs.all   { border-color: rgba(165,180,252,0.3); color: rgba(165,180,252,0.7); }
	.cs.guide { border-color: rgba(251,191,36,0.3);  color: rgba(251,191,36,0.7); }

	.cb {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.58rem; line-height: 1.6; color: rgba(255,255,255,0.45);
		background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
		border-radius: 4px; padding: 0.75rem 1rem;
		white-space: pre; overflow: auto; align-self: stretch;
		pointer-events: auto;
	}
</style>
