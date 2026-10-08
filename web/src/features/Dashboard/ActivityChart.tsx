import {format} from 'date-fns';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import {useDashboardContext} from './DashboardContext';

export function ActivityChart() {
	const data = useDashboardContext();

	const activity: {
		date: string;
		borrowed: number;
		returned: number;
	}[] = data.last14DaysActivity.map((point) => ({
		date: format(point.timestamp, 'MMM dd'),
		borrowed: point.totalBooksBorrowed,
		returned: point.totalBooksReturned,
	}));

	return (
		<ResponsiveContainer width="100%" height={275}>
			<BarChart data={activity} barGap={2}>
				<CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" vertical={false} />
				<XAxis
					dataKey="date"
					tickLine={false}
					axisLine={false}
					tick={{fontSize: 11, fill: 'var(--color-gray-600)'}}
				/>
				<YAxis
					tickLine={false}
					axisLine={false}
					tick={{fontSize: 11, fill: 'var(--color-gray-600)'}}
					width={28}
					allowDecimals={false}
				/>
				<Tooltip
					contentStyle={{
						border: '1px solid var(--color-gray-200)',
						borderRadius: '0.5rem',
						fontSize: '0.75rem',
					}}
					cursor={{fill: 'var(--color-gray-100)'}}
				/>
				<Legend wrapperStyle={{fontSize: '0.75rem'}} iconType="circle" iconSize={8} />
				<Bar
					dataKey="borrowed"
					name="Borrowed"
					fill="var(--color-blue-500)"
					radius={[4, 4, 0, 0]}
					maxBarSize={20}
				/>
				<Bar
					dataKey="returned"
					name="Returned"
					fill="var(--color-green-500)"
					radius={[4, 4, 0, 0]}
					maxBarSize={20}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}
