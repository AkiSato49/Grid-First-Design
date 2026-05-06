<script>
	import { state, COLOR_ROLES } from '$lib/state.svelte.js';

	const COLORS_ROWS = 13;
	let colorsGridStyle = $derived(state.scrollGrid(COLORS_ROWS));

	const lightMap = /** @type {Record<string,string>} */ (/** @type {any} */ (state.colors.light));
	const darkMap  = /** @type {Record<string,string>} */ (/** @type {any} */ (state.colors.dark));

	let cMid = $derived(Math.round((state.cp.c1 + state.grid.cols + 1) / 2));
</script>

<div class="grid-layer" style={state.gridStyle} aria-hidden="true">
	<div class="measure" bind:clientWidth={state.dims.col} bind:clientHeight={state.dims.row}></div>
</div>

<div class="scroll-canvas">
	<div class="scroll-grid" style={colorsGridStyle}>

		{#if state.grid.showCols}
			{#each Array(state.grid.cols) as _,i}<div class="col-guide" style="grid-column:{i+1};grid-row:1/-1;"></div>{/each}
		{/if}
		{#if state.grid.showRows}
			{#each Array(COLORS_ROWS) as _,i}<div class="row-guide" style="grid-row:{i+1};grid-column:1/-1;"></div>{/each}
		{/if}

		<!-- Row 1: title -->
		<p class="ge" style="grid-column:{state.cp.c1}/-1; grid-row:1;">COLORS</p>

		<!-- Row 2: mode toggle + col headers -->
		<div class="mode-toggle" style="grid-column:{state.cp.c1}/{cMid}; grid-row:2;">
			<button class="mode-btn" class:active={state.colors.mode==='light'} onclick={() => state.colors.mode='light'}>Light</button>
			<button class="mode-btn" class:active={state.colors.mode==='dark'}  onclick={() => state.colors.mode='dark'}>Dark</button>
		</div>
		<p class="gc" style="grid-column:{state.cp.c1+1}/{cMid}; grid-row:2; padding-left:3rem;">LIGHT</p>
		<p class="gc" style="grid-column:{cMid}/-1; grid-row:2;">DARK</p>

		<!-- Rows 3–10: one per role -->
		{#each COLOR_ROLES as { key, label }, i}
			{@const row = i + 3}
			<p class="role-label" style="grid-column:{state.cp.c1}/{state.cp.c1+1}; grid-row:{row};">{label}</p>

			<div class="swatch-cell" style="grid-column:{state.cp.c1+1}/{cMid}; grid-row:{row};">
				<input type="color" bind:value={lightMap[key]} class="swatch" />
				<input type="text"  bind:value={lightMap[key]} class="hex" maxlength="7" spellcheck="false" />
				<div class="chip" style="background:{lightMap[key]};"></div>
			</div>

			<div class="swatch-cell" style="grid-column:{cMid}/-1; grid-row:{row};">
				<input type="color" bind:value={darkMap[key]} class="swatch" />
				<input type="text"  bind:value={darkMap[key]} class="hex" maxlength="7" spellcheck="false" />
				<div class="chip" style="background:{darkMap[key]};"></div>
			</div>
		{/each}

		<!-- Row 11: divider -->
		<div class="div-row" style="grid-column:{state.cp.c1}/-1; grid-row:11;"></div>

		<!-- Row 12: preview label -->
		<p class="ge" style="grid-column:{state.cp.c1}/-1; grid-row:12;">PREVIEW — {state.colors.mode}</p>

		<!-- Row 13: live strip -->
		<div class="preview-strip" style="grid-column:{state.cp.c1}/-1; grid-row:13; background:{state.activeColors['bg']};">
			{#each COLOR_ROLES as { key }}
				<div class="preview-chip" style="background:{state.activeColors[key]};" title={key}>
					<span style="font-size:0.45rem; color:{state.activeColors['text']}; opacity:0.5;">{key}</span>
				</div>
			{/each}
			<p style="font-size:{state.sizeVals.td4}rem; color:{state.activeColors['text']}; margin-left:0.75rem; line-height:1; font-weight:{state.typoMap.td4.weight};">
				The quick brown fox — {state.colors.mode}
			</p>
		</div>

	</div>
</div>

<style>
	.ge { font-size: 0.55rem; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.1em; align-self: center; }
	.gc { font-size: 0.55rem; color: rgba(255,255,255,0.15); text-transform: uppercase; letter-spacing: 0.06em; align-self: center; }

	.mode-toggle { display: flex; gap: 0.25rem; align-items: center; pointer-events: auto; }
	.mode-btn {
		padding: 0.15rem 0.5rem; border-radius: 4px;
		background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
		color: rgba(255,255,255,0.4); font-size: 0.65rem; cursor: pointer;
		font-family: inherit; transition: all 0.12s;
	}
	.mode-btn.active { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.2); }

	.role-label { font-size: 0.6rem; color: rgba(255,255,255,0.35); align-self: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

	.swatch-cell { display: flex; align-items: center; gap: 0.4rem; pointer-events: auto; align-self: center; }
	.swatch { width: 22px; height: 22px; border: none; border-radius: 4px; padding: 0; background: none; cursor: pointer; flex-shrink: 0; }
	.hex {
		width: 72px; background: rgba(255,255,255,0.06);
		border: 1px solid rgba(255,255,255,0.12); border-radius: 4px;
		color: rgba(255,255,255,0.7); font-size: 0.62rem; font-family: monospace; padding: 0.15rem 0.3rem;
	}
	.hex:focus { outline: 1px solid #6366f1; }
	.chip { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
	.div-row { border-top: 1px solid rgba(255,255,255,0.06); align-self: center; }
	.preview-strip { display: flex; align-items: center; gap: 0.4rem; padding: 0 0.75rem; border-radius: 4px; overflow: hidden; }
	.preview-chip { width: 2rem; height: 2rem; border-radius: 4px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2px; flex-shrink: 0; }
</style>
