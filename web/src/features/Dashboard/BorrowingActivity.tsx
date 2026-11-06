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
	borrowed: {fill: 'light-dark(#fbbf24, #d97706)', label: 'light-dark(#d97706, #fcd34d)'},
	returned: {fill: 'light-dark(#34d399, #059669)', label: 'light-dark(#059669, #6ee7b7)'},
} as const;

export function BorrowingActivity() {
	const {last14DaysActivity: data} = useDashboardContext();
	const activity: {
		date: string;
		borrowed: number;
		returned: number;
	}[] = data.map((point) => ({
		date: format(point.timestamp, 'MMM dd'),
		borrowed: point.totalBooksBorrowed,
		returned: point.totalBooksReturned,
	}));

	const axisMax = roundedAxisMax(activity.map((point) => Math.max(point.borrowed, point.returned)));
	const tickStep = Math.ceil(axisMax / (9 * 250)) * 250;
	const ticks = Array.from({length: 9}, (_, index) => index * tickStep);

	return (
		<section className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Borrowing activity</h2>
				<p className="text-neutral-600 text-xs dark:text-neutral-300">
					Borrowed and returned copies over the last 14 days
				</p>
			</div>

			<div className="relative min-h-68.75 flex-1">
				<ResponsiveContainer width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
					<BarChart data={activity} barGap={2}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--dashboard-chart-grid)"
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tick={{fontSize: 11, fill: 'var(--dashboard-chart-label)'}}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tick={{fontSize: 11, fill: 'var(--dashboard-chart-label)'}}
							width={60}
							allowDecimals={false}
							tickFormatter={(value: number) => value.toLocaleString()}
							domain={[0, ticks[8]]}
							ticks={ticks}
							interval={0}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'var(--dashboard-chart-surface)',
								border: '1px solid var(--dashboard-chart-border)',
								borderRadius: '0.5rem',
								color: 'var(--dashboard-chart-text)',
								fontSize: '0.75rem',
							}}
							labelStyle={{color: 'var(--dashboard-chart-text)', fontWeight: 600}}
							itemStyle={{color: 'var(--dashboard-chart-item)'}}
							cursor={{fill: 'var(--dashboard-chart-cursor)'}}
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
