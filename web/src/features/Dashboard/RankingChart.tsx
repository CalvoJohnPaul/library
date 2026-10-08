import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useDashboardContext} from './DashboardContext';

export function RankingChart() {
	const data = useDashboardContext();

	const items: {
		name: string;
		count: number;
	}[] = data.topBorrowedBooksThisMonth.map((book) => ({
		name: book.book.title,
		count: book.total,
	}));

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
					formatter={(value) => [value, 'borrows']}
				/>
				<Bar dataKey="count" fill="var(--color-blue-500)" radius={[0, 4, 4, 0]} maxBarSize={16} />
			</BarChart>
		</ResponsiveContainer>
	);
}
