import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import type {GenrePoint} from './mockData';

const genreColors = [
	'var(--color-blue-500)',
	'var(--color-green-500)',
	'var(--color-violet-500)',
	'var(--color-orange-500)',
	'var(--color-pink-500)',
	'var(--color-cyan-500)',
	'var(--color-gray-400)',
];

interface GenreChartProps {
	genres: GenrePoint[];
}

export function GenreChart({genres}: GenreChartProps) {
	return (
		<ResponsiveContainer width="100%" height={275}>
			<PieChart>
				<Pie
					data={genres}
					dataKey="count"
					nameKey="genre"
					innerRadius="55%"
					outerRadius="80%"
					paddingAngle={2}
					stroke="var(--color-white)"
				>
					{genres.map((genre, index) => (
						<Cell key={genre.genre} fill={genreColors[index % genreColors.length]} />
					))}
				</Pie>
				<Tooltip
					contentStyle={{
						border: '1px solid var(--color-gray-200)',
						borderRadius: '0.5rem',
						fontSize: '0.75rem',
					}}
				/>
				<Legend
					layout="vertical"
					align="right"
					verticalAlign="middle"
					wrapperStyle={{fontSize: '0.75rem'}}
					iconType="circle"
					iconSize={8}
				/>
			</PieChart>
		</ResponsiveContainer>
	);
}
