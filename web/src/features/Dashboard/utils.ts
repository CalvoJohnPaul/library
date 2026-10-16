const AXIS_STEP = 500;

/**
 * Always returns an axis maximum of at least 500, rounded up to the
 * next multiple of 500 (e.g. max 200 -> 500, max 501 -> 1000, max 1200 -> 1500).
 */
export function roundedAxisMax(values: number[]): number {
	const max = Math.max(0, ...values);
	return Math.max(AXIS_STEP, Math.ceil(max / AXIS_STEP) * AXIS_STEP);
}

const BAR_STEP = 100;

/**
 * Always returns a bar maximum of at least 100, rounded up to the
 * next multiple of 100 (e.g. max 100 -> 100, max 101 -> 200, max 250 -> 300).
 */
export function roundedBarMax(values: number[]): number {
	const max = Math.max(0, ...values);
	return Math.max(BAR_STEP, Math.ceil(max / BAR_STEP) * BAR_STEP);
}
