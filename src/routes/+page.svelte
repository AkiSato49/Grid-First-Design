<script>
	import { state } from '$lib/state.svelte.js';
	import Toolbar   from '$lib/components/Toolbar.svelte';
	import GridTab   from '$lib/components/GridTab.svelte';
	import TypeTab   from '$lib/components/TypeTab.svelte';
	import ColorsTab from '$lib/components/ColorsTab.svelte';
	import ExportTab from '$lib/components/ExportTab.svelte';
	import GuideTab  from '$lib/components/GuideTab.svelte';
</script>

<Toolbar />

{#if state.ui.tab === 'grid'}   <GridTab   /> {/if}
{#if state.ui.tab === 'type'}   <TypeTab   /> {/if}
{#if state.ui.tab === 'colors'} <ColorsTab /> {/if}
{#if state.ui.tab === 'export'} <ExportTab /> {/if}
{#if state.ui.tab === 'guide'}  <GuideTab  /> {/if}
