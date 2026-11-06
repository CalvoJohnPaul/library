import type {BookGenre, StatsTopBorrowedBook} from '@library/types';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {getBookGenreLabel} from '@/utils/common';

interface TopBorrowedBooksProps {
	data: StatsTopBorrowedBook[];
	numOfDays: number;
	genre?: BookGenre | null;
	onGenreChange?: (genre: BookGenre | null) => void;
	defaultGenre?: BookGenre | null;
}

export function TopBorrowedBooks(props: TopBorrowedBooksProps) {
	const {data, numOfDays} = props;
	const [genre, setGenre] = useControllableState<BookGenre | null>({
		prop: props.genre,
		defaultProp: props.defaultGenre ?? null,
		onChange: props.onGenreChange,
	});

	const items: {
		id: number;
		title: string;
		author: string;
		count: number;
	}[] = data
		.filter((book) => genre === null || book.book.genre === genre)
		.map((book) => ({
			id: book.book.id,
			title: book.book.title,
			author: book.book.author,
			count: book.total,
		}))
		.slice(0, 5);

	const max = Math.max(0, ...items.map((item) => item.count));
	const axisMax = Math.max(500, Math.ceil(max / 500) * 500);
	const tickStep = Math.ceil(axisMax / (4 * 250)) * 250;
	const ticks = Array.from({length: 5}, (_, index) => index * tickStep);
	const shorten = (text: string) => (text.length > 25 ? `${text.slice(0, 24)}…` : text);

	return (
		<section className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
			<div className="mb-4 flex items-start justify-between gap-2">
				<div>
					<h2 className="font-semibold text-sm">Top borrowed books</h2>
					<p className="text-neutral-600 text-xs dark:text-neutral-300">
						{genre === null
							? `Most borrowed over the last ${numOfDays} days`
							: `Most borrowed over the last ${numOfDays} days · ${getBookGenreLabel(genre)}`}
					</p>
				</div>
				{genre !== null && (
					<button
						type="button"
						onClick={() => setGenre(null)}
						className="rounded-full border border-neutral-200 px-2.5 py-1 text-neutral-600 text-xs hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
					>
						All genres
					</button>
				)}
			</div>

			{items.length === 0 ? (
				<p className="grid min-h-68.75 flex-1 place-items-center text-center text-neutral-600 text-xs dark:text-neutral-300">
					{genre === null
						? `No borrows in the last ${numOfDays} days.`
						: `No borrows in this genre in the last ${numOfDays} days.`}
				</p>
			) : (
				<div className="relative min-h-68.75 flex-1">
					<ResponsiveContainer width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
						<BarChart data={items} layout="vertical" barCategoryGap="25%" margin={{right: 32}}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="var(--dashboard-chart-grid)"
								horizontal={false}
							/>
							<XAxis
								type="number"
								tickLine={false}
								axisLine={false}
								tick={{fontSize: 11, fill: 'var(--dashboard-chart-label)'}}
								allowDecimals={false}
								tickFormatter={(value: number) => value.toLocaleString()}
								domain={[0, ticks[4]]}
								ticks={ticks}
								interval={0}
							/>
							<YAxis
								type="category"
								dataKey="id"
								tickLine={false}
								axisLine={false}
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
								width={185}
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
								dataKey="count"
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
