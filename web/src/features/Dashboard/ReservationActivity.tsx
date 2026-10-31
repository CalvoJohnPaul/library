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
import {useChartColors} from './useChartColors';
import {roundedAxisMax} from './utils';

export function ReservationActivity() {
	const data = useDashboardContext();
	const colors = useChartColors();
	const activity = data.last7DaysReservationActivity.map((point) => ({
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
					<CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						tick={{fontSize: 10, fill: colors.label}}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{fontSize: 10, fill: colors.label}}
						width={60}
						allowDecimals={false}
						tickFormatter={(value: number) => value.toLocaleString()}
						domain={[0, ticks[4]]}
						ticks={ticks}
						interval={0}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: colors.surface,
							border: `1px solid ${colors.border}`,
							borderRadius: '0.5rem',
							color: colors.text,
							fontSize: '0.75rem',
						}}
						labelStyle={{color: colors.text, fontWeight: 600}}
						itemStyle={{color: colors.item}}
						cursor={{fill: colors.cursor}}
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
