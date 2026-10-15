const AXIS_STEP = 500;

/**
 * Always returns an axis maximum of at least 500, rounded up to the
 * next multiple of 500 (e.g. max 200 -> 500, max 501 -> 1000, max 1200 -> 1500).
 */
export function roundedAxisMax(values: number[]): number {
	const max = Math.max(0, ...values);
	return Math.max(AXIS_STEP, Math.ceil(max / AXIS_STEP) * AXIS_STEP);
}
