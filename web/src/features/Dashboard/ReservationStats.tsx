import {CalendarClockIcon, CircleCheckIcon} from 'lucide-react';
import {cx} from 'tailwind-variants';
import {useDashboardContext} from './DashboardContext';

export function ReservationStats() {
	const {totalPendingReservations, totalReadyToClaimReservations} = useDashboardContext();
	const cards = [
		{
			title: 'Pending reservations',
			count: totalPendingReservations,
			icon: CalendarClockIcon,
			accent:
				'border-amber-50 dark:border-amber-950 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300',
		},
		{
			title: 'Ready to claim',
			count: totalReadyToClaimReservations,
			icon: CircleCheckIcon,
			accent:
				'border-emerald-50 dark:border-emerald-950 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300',
		},
	];

	return (
		<div className="grid min-w-0 grid-cols-2 gap-4">
			{cards.map(({title, count, icon: Icon, accent}) => (
				<section
					key={title}
					className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
				>
					<div className="flex items-center justify-between">
						<h2 className="text-gray-600 text-xs dark:text-neutral-300">{title}</h2>
						<div
							className={cx(
								'flex size-6 shrink-0 items-center justify-center rounded-full border',
								accent,
							)}
						>
							<Icon className="size-3.5" />
						</div>
					</div>
					<p className="mt-1 font-bold text-xl">{count.toLocaleString()}</p>
				</section>
			))}
		</div>
	);
}
