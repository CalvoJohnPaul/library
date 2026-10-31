import type {BookGenre} from '@library/types';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {getBookGenreLabel} from '@/utils/common';
import {useDashboardContext} from './DashboardContext';
import {roundedAxisMax} from './utils';

interface TopBorrowedBooksProps {
	genre?: BookGenre | null;
	onGenreChange?: (genre: BookGenre | null) => void;
	defaultGenre?: BookGenre | null;
}

export function TopBorrowedBooks(props: TopBorrowedBooksProps) {
	const data = useDashboardContext();

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
	}[] = data.topBorrowedBooksThisMonth
		.filter((book) => genre === null || book.book.genre === genre)
		.map((book) => ({
			id: book.book.id,
			title: book.book.title,
			author: book.book.author,
			count: book.total,
		}))
		.slice(0, 5);

	const axisMax = roundedAxisMax(items.map((item) => item.count));
	const tickStep = Math.ceil(axisMax / (4 * 250)) * 250;
	const ticks = Array.from({length: 5}, (_, index) => index * tickStep);
	const shorten = (text: string) => (text.length > 25 ? `${text.slice(0, 24)}…` : text);

	return (
		<section className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
			<div className="mb-4 flex items-start justify-between gap-2">
				<div>
					<h2 className="font-semibold text-sm">Top borrowed books</h2>
					<p className="text-gray-600 text-xs dark:text-neutral-300">
						{genre === null
							? 'Most borrowed this month'
							: `Most borrowed this month · ${getBookGenreLabel(genre)}`}
					</p>
				</div>
				{genre !== null && (
					<button
						type="button"
						onClick={() => setGenre(null)}
						className="rounded-full border border-gray-200 px-2.5 py-1 text-gray-600 text-xs hover:bg-gray-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
					>
						All genres
					</button>
				)}
			</div>

			{items.length === 0 ? (
				<p className="grid min-h-68.75 flex-1 place-items-center text-center text-gray-600 text-xs dark:text-neutral-300">
					No borrows in this genre this month
				</p>
			) : (
				<div className="min-h-68.75 flex-1">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={items} layout="vertical" barCategoryGap="25%" margin={{right: 32}}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="var(--chart-grid)"
								horizontal={false}
							/>
							<XAxis
								type="number"
								tickLine={false}
								axisLine={false}
								tick={{fontSize: 11, fill: 'var(--chart-label)'}}
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
										<tspan x={x} dy="-0.2em" fontSize={11} fill="var(--chart-label)">
												{shorten(item.title)}
											</tspan>
										<tspan x={x} dy="1.3em" fontSize={10} fill="var(--chart-muted)">
												{shorten(item.author)}
											</tspan>
										</text>
									);
								}}
								width={185}
							/>
							<Tooltip
								contentStyle={{
									borderRadius: '0.5rem',
									fontSize: '0.75rem',
								}}
								cursor={{fill: 'var(--chart-cursor)'}}
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
