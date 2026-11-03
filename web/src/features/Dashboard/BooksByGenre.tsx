import type {BookGenre} from '@library/types';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {
	Legend,
	Pie,
	PieChart,
	type PieSectorShapeProps,
	ResponsiveContainer,
	Sector,
	Tooltip,
} from 'recharts';
import {getBookGenreLabel} from '@/utils/common';
import {useDashboardContext} from './DashboardContext';

const GENRE_SLICE_COUNT = 6;
const GENRE_COLORS_MAP = [
	{
		fill: 'light-dark(#3b82f6, #2563eb)',
		label: 'light-dark(#2563eb, #93c5fd)',
	},
	{
		fill: 'light-dark(#10b981, #059669)',
		label: 'light-dark(#059669, #6ee7b7)',
	},
	{
		fill: 'light-dark(#a855f7, #9333ea)',
		label: 'light-dark(#9333ea, #d8b4fe)',
	},
	{
		fill: 'light-dark(#f59e0b, #d97706)',
		label: 'light-dark(#d97706, #fcd34d)',
	},
	{
		fill: 'light-dark(#f43f5e, #e11d48)',
		label: 'light-dark(#e11d48, #fda4af)',
	},
	{
		fill: 'light-dark(#06b6d4, #0891b2)',
		label: 'light-dark(#0891b2, #67e8f9)',
	},
	{
		fill: 'light-dark(#a8a29e, #57534e)',
		label: 'light-dark(#78716c, #d4d4d4)',
	},
];

interface GenreDatum {
	genre: string;
	value: BookGenre | null;
	count: number;
	fill: string;
	labelColor: string;
}

interface BooksByGenreProps {
	genre?: BookGenre | null;
	onGenreChange?: (genre: BookGenre | null) => void;
	defaultGenre?: BookGenre | null;
}

export function BooksByGenre(props: BooksByGenreProps) {
	const data = useDashboardContext();

	const [genre, setGenre] = useControllableState<BookGenre | null>({
		prop: props.genre,
		defaultProp: props.defaultGenre ?? null,
		onChange: props.onGenreChange,
	});

	const sortedGenres = data.totalBookCopiesByGenre
		.map((genre) => ({
			genre: getBookGenreLabel(genre.genre),
			value: genre.genre,
			count: genre.total,
		}))
		.toSorted((a, b) => b.count - a.count);

	const topGenres = sortedGenres.slice(0, GENRE_SLICE_COUNT);
	const othersCount = sortedGenres
		.slice(GENRE_SLICE_COUNT)
		.reduce((total, genre) => total + genre.count, 0);

	const mergedGenres =
		othersCount > 0
			? [...topGenres, {genre: 'Others', value: null as BookGenre | null, count: othersCount}]
			: topGenres;

	const genres: GenreDatum[] = mergedGenres.map((genre, index) => {
		const colors = GENRE_COLORS_MAP[index % GENRE_COLORS_MAP.length];
		return {...genre, fill: colors.fill, labelColor: colors.label};
	});

	return (
		<section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Books by genre</h2>
				<p className="text-neutral-600 text-xs dark:text-neutral-300">
					{genre === null
						? 'Distribution across the catalog'
						: `Distribution across the catalog · ${getBookGenreLabel(genre)}`}
				</p>
			</div>

			<ResponsiveContainer width="100%" height={275}>
				<PieChart>
					<Pie
						data={genres}
						dataKey="count"
						nameKey="genre"
						innerRadius="55%"
						outerRadius="80%"
						cornerRadius={2}
						paddingAngle={2}
						stroke="var(--dashboard-chart-surface)"
						onClick={(_, index) => {
							const item = genres[index];
							if (!item || item.value === null) return;
							setGenre(item.value === genre ? null : item.value);
						}}
						shape={(props: PieSectorShapeProps) => {
							const datum = props.payload as GenreDatum;

							return (
								<Sector
									{...props}
									fill={datum.fill}
									fillOpacity={genre !== null && datum.value !== genre ? 0.25 : 1}
									className={datum.value === null ? undefined : 'cursor-pointer'}
								/>
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
					/>
					<Legend
						position="right"
						itemSorter={(item) => genres.findIndex((datum) => datum.genre === item.value)}
						wrapperStyle={{fontSize: '0.75rem'}}
						iconType="circle"
						iconSize={8}
						formatter={(value, entry) => (
							<span style={{color: (entry?.payload as {labelColor?: string})?.labelColor}}>
								{value}
							</span>
						)}
					/>
				</PieChart>
			</ResponsiveContainer>
		</section>
	);
}
