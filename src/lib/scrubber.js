/**
 * Svelte action — click-drag to scrub a numeric value.
 * @param {HTMLElement} node
 * @param {{ get: () => number, set: (v: number) => void, sensitivity: number, min: number, max: number, step: number }} opts
 */
export function scrub(node, opts) {
	let startX = 0, startVal = 0;

	function onDown(/** @type {MouseEvent} */ e) {
		startX   = e.clientX;
		startVal = opts.get();
		document.body.style.cursor     = 'ew-resize';
		document.body.style.userSelect = 'none';
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup',   onUp);
		e.preventDefault();
	}

	function onMove(/** @type {MouseEvent} */ e) {
		const raw     = startVal + (e.clientX - startX) * opts.sensitivity;
		const stepped = Math.round(raw / opts.step) * opts.step;
		const clamped = Math.min(opts.max, Math.max(opts.min, stepped));
		opts.set(parseFloat(clamped.toFixed(4)));
	}

	function onUp() {
		document.body.style.cursor     = '';
		document.body.style.userSelect = '';
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup',   onUp);
	}

	node.addEventListener('mousedown', onDown);
	return { destroy() { node.removeEventListener('mousedown', onDown); } };
}
