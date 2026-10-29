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
	const data = useDashboardContext();
	const activity = data.last7DaysReservationActivity.map((point) => ({
		date: format(point.timestamp, 'MMM d'),
		reserved: point.totalBooksReserved,
		unreserved: point.totalBooksUnreserved,
	}));
	const axisMax = roundedAxisMax(
		activity.map((point) => Math.max(point.reserved, point.unreserved)),
	);
	const tickStep = Math.ceil(axisMax / (3 * 500)) * 500;
	const ticks = Array.from({length: 4}, (_, index) => index * tickStep);

	return (
		<section className="rounded-xl border border-gray-200 bg-white p-5">
			<div className="mb-4">
				<h2 className="font-semibold text-sm">Reservation activity</h2>
				<p className="text-gray-600 text-xs">Reserved and unreserved books over the last 7 days</p>
			</div>
			<ResponsiveContainer width="100%" height={180}>
				<BarChart data={activity} barGap={1}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" vertical={false} />
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						tick={{fontSize: 10, fill: 'var(--color-gray-600)'}}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{fontSize: 10, fill: 'var(--color-gray-600)'}}
						width={60}
						allowDecimals={false}
						tickFormatter={(value: number) => value.toLocaleString()}
						domain={[0, ticks[3]]}
						ticks={ticks}
						interval={0}
					/>
					<Tooltip
						contentStyle={{borderRadius: '0.5rem', fontSize: '0.75rem'}}
						cursor={{fill: 'var(--color-gray-100)'}}
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
