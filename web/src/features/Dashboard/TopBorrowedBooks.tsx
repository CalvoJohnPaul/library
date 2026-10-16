import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useDashboardContext} from './DashboardContext';
import {roundedAxisMax} from './utils';

export function TopBorrowedBooks() {
	const data = useDashboardContext();

	const items: {
		name: string;
		count: number;
	}[] = data.topBorrowedBooksThisMonth.map((book) => ({
		name: book.book.title,
		count: book.total,
	}));

	const axisMax = roundedAxisMax(items.map((item) => item.count));

	return (
		<section className="rounded-xl border border-gray-200 bg-white p-5">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Top borrowed books</h2>
				<p className="text-gray-600 text-xs">Most borrowed this month</p>
			</div>

			<ResponsiveContainer width="100%" height={275}>
				<BarChart data={items} layout="vertical" barCategoryGap="25%">
					<CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" horizontal={false} />
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
					<Bar dataKey="count" fill="var(--color-blue-400)" radius={[0, 4, 4, 0]} maxBarSize={16} />
				</BarChart>
			</ResponsiveContainer>
		</section>
	);
}
