export function roundedAxisMax(values: number[]): number {
	const max = Math.max(0, ...values);
	return Math.max(500, Math.ceil(max / 500) * 500);
}

export function roundedBarMax(values: number[]): number {
	const max = Math.max(0, ...values);
	return Math.max(100, Math.ceil(max / 100) * 100);
}
