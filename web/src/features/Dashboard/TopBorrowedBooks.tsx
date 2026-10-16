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
		name: string;
		count: number;
	}[] = data.topBorrowedBooksThisMonth
		.filter((book) => genre === null || book.book.genre === genre)
		.map((book) => ({name: book.book.title, count: book.total}))
		.slice(0, 5);

	const axisMax = roundedAxisMax(items.map((item) => item.count));

	return (
		<section className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
			<div className="mb-4 flex items-start justify-between gap-2">
				<div>
					<h2 className="font-semibold text-sm">Top borrowed books</h2>
					<p className="text-gray-600 text-xs">
						{genre === null
							? 'Most borrowed this month'
							: `Most borrowed this month · ${getBookGenreLabel(genre)}`}
					</p>
				</div>
				{genre !== null && (
					<button
						type="button"
						onClick={() => setGenre(null)}
						className="rounded-full border border-gray-200 px-2.5 py-1 text-gray-600 text-xs hover:bg-gray-100"
					>
						All genres
					</button>
				)}
			</div>

			{items.length === 0 ? (
				<p className="pt-16 text-center text-gray-600 text-xs">
					No borrows in this genre this month
				</p>
			) : (
				<ResponsiveContainer width="100%" height={275}>
					<BarChart data={items} layout="vertical" barCategoryGap="25%">
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--color-gray-200)"
							horizontal={false}
						/>
						<XAxis
							type="number"
							tickLine={false}
							axisLine={false}
							tick={{fontSize: 11, fill: 'var(--color-gray-600)'}}
							allowDecimals={false}
							domain={[0, axisMax]}
						/>
						<YAxis
							type="category"
							dataKey="name"
							tickLine={false}
							axisLine={false}
							tick={{fontSize: 11, fill: 'var(--color-gray-600)'}}
							width={140}
						/>
						<Tooltip
							contentStyle={{
								borderRadius: '0.5rem',
								fontSize: '0.75rem',
							}}
							cursor={{fill: 'var(--color-gray-100)'}}
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
			)}
		</section>
	);
}
