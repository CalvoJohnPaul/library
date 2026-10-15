import {Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {getBookGenreLabel} from '@/utils/common';
import {useDashboardContext} from './DashboardContext';

const GENRE_SLICE_COUNT = 6;
const GENRE_COLORS_MAP = [
	'var(--color-blue-500)',
	'var(--color-emerald-500)',
	'var(--color-purple-500)',
	'var(--color-amber-500)',
	'var(--color-rose-500)',
	'var(--color-cyan-500)',
	'var(--color-stone-400)',
];

export function GenreChart() {
	const data = useDashboardContext();

	const sortedGenres = data.totalBookCopiesByGenre
		.map((genre) => ({genre: getBookGenreLabel(genre.genre), count: genre.total}))
		.sort((a, b) => b.count - a.count);

	const topGenres = sortedGenres.slice(0, GENRE_SLICE_COUNT);
	const othersCount = sortedGenres
		.slice(GENRE_SLICE_COUNT)
		.reduce((total, genre) => total + genre.count, 0);

	const mergedGenres =
		othersCount > 0 ? [...topGenres, {genre: 'Others', count: othersCount}] : topGenres;

	const genres: {
		genre: string;
		count: number;
		fill: string;
	}[] = mergedGenres.map((genre, index) => ({
		...genre,
		fill: GENRE_COLORS_MAP[index % GENRE_COLORS_MAP.length],
	}));

	return (
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
				/>
			</PieChart>
		</ResponsiveContainer>
	);
}
