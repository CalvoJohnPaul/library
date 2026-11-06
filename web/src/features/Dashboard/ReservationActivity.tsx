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

export function ReservationActivity() {
	const {last7DaysReservationActivity: data} = useDashboardContext();
	const activity = data.map((point) => ({
		date: format(point.timestamp, 'MMM d'),
		reserved: point.totalBooksReserved,
		unreserved: point.totalBooksUnreserved,
	}));
	const axisMax = roundedAxisMax(
		activity.map((point) => Math.max(point.reserved, point.unreserved)),
	);
	const tickStep = Math.ceil(axisMax / (4 * 250)) * 250;
	const ticks = Array.from({length: 5}, (_, index) => index * tickStep);

	return (
		<section className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Reservation activity</h2>
				<p className="text-neutral-600 text-xs dark:text-neutral-300">
					Reserved and unreserved books over the last 7 days
				</p>
			</div>
			<ResponsiveContainer width="100%" height={180}>
				<BarChart data={activity} barGap={1}>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="var(--dashboard-chart-grid)"
						vertical={false}
					/>
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						tick={{fontSize: 10, fill: 'var(--dashboard-chart-label)'}}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{fontSize: 10, fill: 'var(--dashboard-chart-label)'}}
						width={60}
						allowDecimals={false}
						tickFormatter={(value: number) => value.toLocaleString()}
						domain={[0, ticks[4]]}
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
					<Legend wrapperStyle={{fontSize: '0.75rem'}} iconType="circle" iconSize={8} />
					<Bar
						dataKey="reserved"
						name="Reserved"
						fill="var(--color-blue-400)"
						radius={[4, 4, 0, 0]}
						maxBarSize={12}
					/>
					<Bar
						dataKey="unreserved"
						name="Unreserved"
						fill="var(--color-rose-400)"
						radius={[4, 4, 0, 0]}
						maxBarSize={12}
					/>
				</BarChart>
			</ResponsiveContainer>
		</section>
	);
}
