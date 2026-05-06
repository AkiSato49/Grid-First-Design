<script>
	import { state } from '$lib/state.svelte.js';
</script>

<!-- Measurement — keeps dims.col / dims.row live -->
<div class="grid-layer" style={state.gridStyle} aria-hidden="true">
	<div class="measure" bind:clientWidth={state.dims.col} bind:clientHeight={state.dims.row}></div>
</div>

{#if state.grid.showCells}
<div class="grid-layer" style={state.gridStyle}>
	{#each Array(state.grid.cols * state.grid.rows) as _}<div class="cell"></div>{/each}
</div>
{/if}

{#if state.grid.showCols}
<div class="grid-layer" style={state.gridStyle}>
	{#each Array(state.grid.cols) as _,i}<div class="col-guide" style="grid-column:{i+1};grid-row:1/-1;"></div>{/each}
</div>
{/if}

{#if state.grid.showRows}
<div class="grid-layer" style={state.gridStyle}>
	{#each Array(state.grid.rows) as _,i}<div class="row-guide" style="grid-row:{i+1};grid-column:1/-1;"></div>{/each}
</div>
{/if}

<!-- Composition -->
<div class="grid-layer interactive" style={state.gridStyle}>

	<p class="comp" style="grid-column:{state.cp.c1}/-1; grid-row:{state.cp.r1}/span 2;
		font-size:{state.tx2}rem; font-weight:{state.typoMap.tx2.weight};
		letter-spacing:{state.typoMap.tx2.ls}em; margin-left:{state.typoMap.tx2.ml}em; line-height:1;">
		The Grid
	</p>

	<p class="comp" style="grid-column:{state.cp.c1}/{state.cp.c2}; grid-row:{state.cp.r2}/span 2;
		font-size:{state.tx1}rem; font-weight:{state.typoMap.tx1.weight};
		letter-spacing:{state.typoMap.tx1.ls}em; margin-left:{state.typoMap.tx1.ml}em; line-height:1;">
		How it organizes us
	</p>

	<p class="comp" style="grid-column:{state.cp.c3}/{state.cp.c4}; grid-row:{state.cp.r2}/span 2;
		font-size:{state.td2}rem; font-weight:{state.typoMap.td2.weight};
		letter-spacing:{state.typoMap.td2.ls}em; margin-left:{state.typoMap.td2.ml}em; line-height:1;">
		Structure is the silence between the notes
	</p>

	<p class="comp" style="grid-column:{state.cp.c1}/-1; grid-row:{state.cp.r3};
		font-size:{state.td4}rem; font-weight:{state.typoMap.td4.weight};
		letter-spacing:{state.typoMap.td4.ls}em; margin-left:{state.typoMap.td4.ml}em; line-height:1;">
		The grid is not a constraint — it is a language shared between those who make things
	</p>

	<p class="comp" style="grid-column:{state.cp.c1}/-1; grid-row:{state.cp.r4};
		font-size:{state.td4}rem; font-weight:{state.typoMap.td4.weight};
		letter-spacing:{state.typoMap.td4.ls}em; margin-left:{state.typoMap.td4.ml}em; line-height:1;">
		Twelve columns. Eight rows. One system. Infinite compositions.
	</p>

</div>
