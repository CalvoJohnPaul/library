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
	{fill: 'var(--color-blue-400)', label: 'var(--color-blue-500)'},
	{fill: 'var(--color-emerald-400)', label: 'var(--color-emerald-500)'},
	{fill: 'var(--color-purple-400)', label: 'var(--color-purple-500)'},
	{fill: 'var(--color-amber-400)', label: 'var(--color-amber-500)'},
	{fill: 'var(--color-rose-400)', label: 'var(--color-rose-500)'},
	{fill: 'var(--color-cyan-400)', label: 'var(--color-cyan-500)'},
	{fill: 'var(--color-stone-300)', label: 'var(--color-stone-500)'},
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
		<section className="rounded-xl border border-gray-200 bg-white p-5">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Books by genre</h2>
				<p className="text-gray-600 text-xs">
					{genre === null
						? 'Distribution across the catalog · click a genre to filter'
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
						cornerRadius={4}
						paddingAngle={2}
						stroke="var(--color-white)"
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
							borderRadius: '0.5rem',
							fontSize: '0.75rem',
						}}
					/>
					<Legend
						position="right"
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
