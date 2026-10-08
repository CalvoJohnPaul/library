import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

export interface RankingItem {
	name: string;
	count: number;
}

interface RankingChartProps {
	items: RankingItem[];
	color: string;
	unitLabel: string;
}

export function RankingChart({items, color, unitLabel}: RankingChartProps) {
	return (
		<ResponsiveContainer width="100%" height={275}>
			<BarChart data={items} layout="vertical" barCategoryGap="25%">
				<CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" horizontal={false} />
				<XAxis
					type="number"
					tickLine={false}
					axisLine={false}
					tick={{fontSize: 11, fill: 'var(--color-gray-600)'}}
					allowDecimals={false}
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
						border: '1px solid var(--color-gray-200)',
						borderRadius: '0.5rem',
						fontSize: '0.75rem',
					}}
					cursor={{fill: 'var(--color-gray-100)'}}
					formatter={(value) => [value, unitLabel]}
				/>
				<Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} maxBarSize={16} />
			</BarChart>
		</ResponsiveContainer>
	);
}
