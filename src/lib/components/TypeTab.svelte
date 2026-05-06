<script>
	import { state, TYPE_SIZES, TYPE_ROWS } from '$lib/state.svelte.js';
	import { scrub } from '$lib/scrubber.js';
</script>

<div class="grid-layer" style={state.gridStyle} aria-hidden="true">
	<div class="measure" bind:clientWidth={state.dims.col} bind:clientHeight={state.dims.row}></div>
</div>

<div class="scroll-canvas">
	<div class="scroll-grid" style={state.typeGridStyle}>

		{#if state.grid.showCols}
			{#each Array(state.grid.cols) as _,i}<div class="col-guide" style="grid-column:{i+1};grid-row:1/-1;"></div>{/each}
		{/if}
		{#if state.grid.showRows}
			{#each Array(TYPE_ROWS) as _,i}<div class="row-guide" style="grid-row:{i+1};grid-column:1/-1;"></div>{/each}
		{/if}

		{#each TYPE_SIZES as { key, label, span, startRow }}
			{@const t   = state.typoMap[key]}
			{@const sz  = state.sizeVals[key]}
			{@const row = `${startRow}/span ${span}`}

			<div class="ctrl" style="grid-column:1/3; grid-row:{row};">
				<div class="ctrl-head">
					<span class="ctrl-name">{label}</span>
					<span class="ctrl-rem">{state.rfmt(sz)}rem</span>
					<button class="reset-btn" onclick={() => state.resetTypo(key)}>↺</button>
				</div>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="ctrl-row" use:scrub={{ get: () => t.weight, set: v => t.weight=v, sensitivity: 2,     min: 100,  max: 900, step: 100   }}>
					<span class="lbl">W</span><span class="num">{t.weight}</span>
				</span>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="ctrl-row" use:scrub={{ get: () => t.ls,     set: v => t.ls    =v, sensitivity: 0.001, min: -0.1, max: 0.3, step: 0.001 }}>
					<span class="lbl">LS</span><span class="num">{state.rfmt(t.ls)}em</span>
				</span>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="ctrl-row" use:scrub={{ get: () => t.ml,     set: v => t.ml    =v, sensitivity: 0.001, min: -0.2, max: 0.1, step: 0.001 }}>
					<span class="lbl">ML</span><span class="num">{state.rfmt(t.ml)}em</span>
				</span>
			</div>

			<p class="demo" style="grid-column:3/-1; grid-row:{row};
				font-size:{sz}rem; font-weight:{t.weight};
				letter-spacing:{t.ls}em; margin-left:{t.ml}em; line-height:1;">
				The quick brown fox
			</p>
		{/each}

	</div>
</div>

<style>
	.ctrl {
		display: grid; grid-template-columns: 1fr 1fr;
		align-content: center; gap: 0.2rem 0.75rem;
		padding: 0.25rem 0.75rem 0.25rem 0;
		overflow: visible; pointer-events: auto;
	}
	.ctrl-head { grid-column: 1/-1; display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem; }
	.ctrl-name { font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.85); flex: 1; }
	.ctrl-rem  { font-size: 0.7rem; font-family: monospace; color: rgba(255,255,255,0.3); }
	.reset-btn {
		background: none; border: 1px solid rgba(255,255,255,0.12); border-radius: 4px;
		color: rgba(255,255,255,0.25); font-size: 0.7rem; padding: 0.1rem 0.3rem;
		cursor: pointer; transition: all 0.12s; line-height: 1;
	}
	.reset-btn:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.35); }
	.ctrl-row { display: flex; align-items: center; gap: 0.4rem; cursor: ew-resize; user-select: none; width: fit-content; }
	.ctrl-row:hover .lbl { color: rgba(255,255,255,0.7); }
	.ctrl-row:hover .num { color: rgba(255,255,255,0.9); }
	.lbl { font-size: 0.65rem; color: rgba(255,255,255,0.3); font-family: monospace; width: 1.6rem; }
	.num { font-size: 0.75rem; font-family: monospace; color: rgba(255,255,255,0.65); font-variant-numeric: tabular-nums; }
</style>
