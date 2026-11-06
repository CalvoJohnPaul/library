import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useOverviewContext} from './OverviewContext';

export function TopBorrowedBooks() {
	const {topBorrowedBooksLast90Days} = useOverviewContext();
	const items = topBorrowedBooksLast90Days.map(({book, total}) => ({...book, total}));
	const max = Math.max(0, ...items.map((item) => item.total));
	const tickStep = Math.max(250, Math.ceil(max / (4 * 250)) * 250);
	const ticks = Array.from({length: 5}, (_, index) => index * tickStep);
	const shorten = (text: string) => (text.length > 20 ? `${text.slice(0, 19)}…` : text);

	return (
		<section className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Top borrowed books</h2>
				<p className="text-neutral-600 text-xs dark:text-neutral-300">
					Most borrowed over the last 90 days
				</p>
			</div>
			{items.length === 0 ? (
				<p className="grid min-h-68.75 flex-1 place-items-center text-center text-neutral-600 text-xs dark:text-neutral-300">
					No borrows in the last 90 days.
				</p>
			) : (
				<div className="relative min-h-68.75 flex-1">
					<ResponsiveContainer width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
						<BarChart data={items} layout="vertical" barCategoryGap="25%" margin={{right: 16}}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="var(--dashboard-chart-grid)"
								horizontal={false}
							/>
							<XAxis
								type="number"
								tickLine={false}
								axisLine={false}
								allowDecimals={false}
								tickFormatter={(value: number) => value.toLocaleString()}
								domain={[0, ticks[4]]}
								ticks={ticks}
								interval={0}
								tick={{fontSize: 11, fill: 'var(--dashboard-chart-label)'}}
							/>
							<YAxis
								type="category"
								dataKey="id"
								tickLine={false}
								axisLine={false}
								width={120}
								tick={({x, y, payload}) => {
									const item = items.find((book) => book.id === Number(payload.value));
									if (!item) return null;
									return (
										<text x={x} y={y} textAnchor="end">
											<tspan x={x} dy="-0.2em" fontSize={11} fill="var(--dashboard-chart-label)">
												{shorten(item.title)}
											</tspan>
											<tspan x={x} dy="1.3em" fontSize={10} fill="var(--dashboard-chart-muted)">
												{shorten(item.author)}
											</tspan>
										</text>
									);
								}}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: 'var(--dashboard-chart-surface)',
									border: '1px solid var(--dashboard-chart-border)',
									borderRadius: '0.5rem',
									color: 'var(--dashboard-chart-text)',
									fontSize: '0.75rem',
								}}
								labelStyle={{color: 'var(--dashboard-chart-text)', fontWeight: 600}}
								itemStyle={{color: 'var(--dashboard-chart-item)'}}
								cursor={{fill: 'var(--dashboard-chart-cursor)'}}
								labelFormatter={(value) => {
									const item = items.find((book) => book.id === Number(value));
									return item ? `${item.title} — ${item.author}` : value;
								}}
								formatter={(value) => [value, 'borrows']}
							/>
							<Bar
								dataKey="total"
								fill="var(--color-blue-400)"
								radius={[0, 4, 4, 0]}
								maxBarSize={16}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}
		</section>
	);
}
