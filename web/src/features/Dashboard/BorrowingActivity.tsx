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
	const tickStep = Math.ceil(axisMax / (9 * 500)) * 500;
	const ticks = Array.from({length: 10}, (_, index) => index * tickStep);

	return (
		<section className="flex flex-col rounded-xl border border-gray-200 bg-white p-5">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Borrowing activity</h2>
				<p className="text-gray-600 text-xs">Borrowed and returned copies over the last 14 days</p>
			</div>

			<div className="min-h-68.75 flex-1">
				<ResponsiveContainer width="100%" height="100%">
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
							width={60}
							allowDecimals={false}
							tickFormatter={(value: number) => value.toLocaleString()}
							domain={[0, ticks[9]]}
							ticks={ticks}
							interval={0}
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
			</div>
		</section>
	);
}
