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
import {roundedAxisMax} from './utils';

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

	const axisMax = roundedAxisMax(activity.map((point) => Math.max(point.borrowed, point.returned)));

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
					domain={[0, axisMax]}
				/>
				<Tooltip
					contentStyle={{
						borderRadius: '0.5rem',
						fontSize: '0.75rem',
					}}
					cursor={{fill: 'var(--color-gray-100)'}}
				/>
				<Legend wrapperStyle={{fontSize: '0.75rem'}} iconType="circle" iconSize={8} />
				<Bar
					dataKey="borrowed"
					name="Borrowed"
					fill="var(--color-amber-500)"
					radius={[4, 4, 0, 0]}
					maxBarSize={20}
					isAnimationActive
				/>
				<Bar
					dataKey="returned"
					name="Returned"
					fill="var(--color-emerald-500)"
					radius={[4, 4, 0, 0]}
					maxBarSize={20}
					isAnimationActive
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}
