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

const ACTIVITY_SERIES = {
	borrowed: {fill: 'var(--color-amber-400)', label: 'var(--color-amber-600)'},
	returned: {fill: 'var(--color-emerald-400)', label: 'var(--color-emerald-600)'},
} as const;

export function BorrowingActivity() {
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
		<section className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Borrowing activity</h2>
				<p className="text-gray-600 text-xs">Borrowed and returned copies over the last 14 days</p>
			</div>

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
					<Legend
						wrapperStyle={{fontSize: '0.75rem'}}
						iconType="circle"
						iconSize={8}
						formatter={(value, entry) => (
							<span
								style={{
									color: ACTIVITY_SERIES[entry?.dataKey as keyof typeof ACTIVITY_SERIES]?.label,
								}}
							>
								{value}
							</span>
						)}
					/>
					<Bar
						dataKey="borrowed"
						name="Borrowed"
						fill={ACTIVITY_SERIES.borrowed.fill}
						radius={[4, 4, 0, 0]}
						maxBarSize={20}
						isAnimationActive
					/>
					<Bar
						dataKey="returned"
						name="Returned"
						fill={ACTIVITY_SERIES.returned.fill}
						radius={[4, 4, 0, 0]}
						maxBarSize={20}
						isAnimationActive
					/>
				</BarChart>
			</ResponsiveContainer>
		</section>
	);
}
