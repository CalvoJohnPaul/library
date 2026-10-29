import {CalendarClockIcon, CircleCheckIcon} from 'lucide-react';
import {useDashboardContext} from './DashboardContext';

export function ReservationStats() {
	const {totalPendingReservations, totalReadyToClaimReservations} = useDashboardContext();
	const cards = [
		{
			title: 'Pending reservations',
			count: totalPendingReservations,
			icon: CalendarClockIcon,
			accent: 'border-amber-600/25 bg-amber-600/10 text-amber-700',
		},
		{
			title: 'Ready to claim',
			count: totalReadyToClaimReservations,
			icon: CircleCheckIcon,
			accent: 'border-emerald-600/25 bg-emerald-600/10 text-emerald-700',
		},
	];

	return (
		<div className="grid min-w-0 grid-cols-2 gap-4">
			{cards.map(({title, count, icon: Icon, accent}) => (
				<section key={title} className="min-w-0 rounded-xl border border-gray-200 bg-white p-3">
					<div className="flex items-center justify-between">
						<h2 className="text-gray-600 text-xs">{title}</h2>
						<div
							className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${accent}`}
						>
							<Icon className="size-4" />
						</div>
					</div>
					<p className="mt-1 font-bold text-xl">{count.toLocaleString()}</p>
				</section>
			))}
		</div>
	);
}
