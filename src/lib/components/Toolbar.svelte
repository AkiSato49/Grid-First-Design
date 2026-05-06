<script>
	import { state } from '$lib/state.svelte.js';
	import { scrub } from '$lib/scrubber.js';

	$effect(() => {
		state.dims.rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
	});

	const TABS = /** @type {const} */ (['grid', 'type', 'colors', 'export', 'guide']);
</script>

<div class="toolbar">

	<div class="tabs">
		{#each TABS as t}
			<button class="tab-btn" class:active={state.ui.tab === t} onclick={() => state.ui.tab = t}>
				{t}
			</button>
		{/each}
	</div>

	<div class="sep"></div>

	<div class="group">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="scrubber" use:scrub={{ get: () => state.grid.cols,   set: v => state.grid.cols   = v, sensitivity: 0.15, min: 1, max: 48, step: 1    }}>cols <b>{state.grid.cols}</b></span>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="scrubber" use:scrub={{ get: () => state.grid.rows,   set: v => state.grid.rows   = v, sensitivity: 0.15, min: 1, max: 48, step: 1    }}>rows <b>{state.grid.rows}</b></span>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="scrubber" use:scrub={{ get: () => state.grid.gutter, set: v => state.grid.gutter = v, sensitivity: 0.01, min: 0, max: 10, step: 0.25 }}>gutter <b>{state.grid.gutter}rem</b></span>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="scrubber" use:scrub={{ get: () => state.grid.margin, set: v => state.grid.margin = v, sensitivity: 0.01, min: 0, max: 20, step: 0.25 }}>margin <b>{state.grid.margin}rem</b></span>
	</div>

	<div class="sep"></div>

	<div class="group">
		<label class="toggle"><input type="checkbox" bind:checked={state.grid.showCells}/><span>cells</span></label>
		<label class="toggle"><input type="checkbox" bind:checked={state.grid.showCols} /><span>cols</span></label>
		<label class="toggle"><input type="checkbox" bind:checked={state.grid.showRows} /><span>rows</span></label>
	</div>

</div>

<style>
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
		padding: 0.2rem 0.55rem; background: transparent;
		border: 1px solid transparent; border-radius: 5px;
		color: rgba(255,255,255,0.35); font-size: 0.7rem;
		cursor: pointer; font-family: inherit; transition: all 0.12s;
		text-transform: capitalize;
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
</style>
