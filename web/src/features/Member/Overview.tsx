import {BookOpenIcon, CalendarClockIcon, CircleCheckIcon, ClockIcon} from 'lucide-react';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Stat} from '@/components/ui/Stat';
import {useMemberStatsQuery} from '@/hooks/useMemberStatsQuery';
import {BorrowingActivity} from '@/templates/BorrowingActivity';
import {DeltaBadge} from '@/templates/DeltaBadge';
import {ReservationActivity} from '@/templates/ReservationActivity';
import {TopBorrowedBooks} from '@/templates/TopBorrowedBooks';
import {useMemberContext} from './MemberContext';

export function Overview() {
	const member = useMemberContext();
	const query = useMemberStatsQuery(member.id);

	if (query.isPending) {
		return (
			<div className="flex items-center gap-1.5">
				<SpinnerIcon className="size-4.5 text-blue-500 dark:text-blue-400" />
				<span className="text-neutral-600 dark:text-neutral-300">Loading.</span>
			</div>
		);
	}
	if (query.isError) {
		return <p className="text-red-500 text-sm">Unable to load member statistics.</p>;
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
			<div className="flex min-w-0 flex-col gap-4 sm:col-span-12 xl:col-span-8">
				<div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-8">
					<Stat.Root size="md" accent="info" className="sm:col-span-4 xl:col-span-3">
						<Stat.Label>Total books borrowed</Stat.Label>
						<Stat.Icon>
							<BookOpenIcon />
						</Stat.Icon>
						<Stat.ValueText>
							{query.data.monthOverMonth.borrows.current.toLocaleString()}
						</Stat.ValueText>
						<DeltaBadge delta={query.data.monthOverMonth.borrows} />
						<Stat.HelpText>borrowed this month</Stat.HelpText>
					</Stat.Root>
					<Stat.Root size="md" accent="warning" className="sm:col-span-4 xl:col-span-3">
						<Stat.Label>Outstanding borrows</Stat.Label>
						<Stat.Icon>
							<ClockIcon />
						</Stat.Icon>
						<Stat.ValueText>{query.data.totalOutstandingBorrows.toLocaleString()}</Stat.ValueText>
						<DeltaBadge delta={query.data.monthOverMonth.borrows} />
						<Stat.HelpText>copies currently borrowed</Stat.HelpText>
					</Stat.Root>
					<div className="flex min-w-0 flex-row gap-3 sm:col-span-8 xl:col-span-2 xl:flex-col [&>*]:flex-1">
						<Stat.Root size="sm" accent="warning">
							<Stat.Label>Pending reservations</Stat.Label>
							<Stat.Icon>
								<CalendarClockIcon />
							</Stat.Icon>
							<Stat.ValueText>
								{query.data.totalPendingReservations.toLocaleString()}
							</Stat.ValueText>
						</Stat.Root>
						<Stat.Root size="sm" accent="success">
							<Stat.Label>Ready to claim</Stat.Label>
							<Stat.Icon>
								<CircleCheckIcon />
							</Stat.Icon>
							<Stat.ValueText>
								{query.data.totalReadyToClaimReservations.toLocaleString()}
							</Stat.ValueText>
						</Stat.Root>
					</div>
				</div>
				<div className="min-w-0 flex-1 [&>section]:h-full">
					<BorrowingActivity data={query.data.last14DaysActivity} />
				</div>
			</div>
			<div className="flex min-w-0 flex-col gap-4 sm:col-span-12 xl:col-span-4">
				<ReservationActivity data={query.data.last7DaysReservationActivity} />
				<div className="min-w-0 flex-1 [&>section]:h-full">
					<TopBorrowedBooks data={query.data.topBorrowedBooksLast90Days} numOfDays={90} />
				</div>
			</div>
		</div>
	);
}
