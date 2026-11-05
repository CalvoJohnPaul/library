import type {FastifyInstance} from 'fastify';

const maxRows = 5000;
const maxBytes = 5 * 1024 * 1024;
let active = false;

export async function runExport<T>(app: FastifyInstance, callback: () => Promise<T>): Promise<T> {
	if (active) throw app.httpErrors.tooManyRequests('Another export is already running');
	active = true;
	try {
		return await callback();
	} finally {
		active = false;
	}
}

export async function loadExportRows<T>(
	app: FastifyInstance,
	findMany: (take: number, skip: number) => Promise<T[]>,
): Promise<T[]> {
	const rows: T[] = [];
	let bytes = 0;
	while (rows.length <= maxRows) {
		const take = Math.min(25, maxRows + 1 - rows.length);
		const batch = await findMany(take, rows.length);
		for (const row of batch) {
			bytes += Buffer.byteLength(JSON.stringify(row));
			if (rows.length === maxRows || bytes > maxBytes) {
				throw app.httpErrors.payloadTooLarge(
					'Export exceeds 5,000 rows or 5 MiB. Narrow your filters and try again.',
				);
			}
			rows.push(row);
		}
		if (batch.length < take) return rows;
	}
	return rows;
}
