import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {useMemberStatsQuery} from '@/hooks/useMemberStatsQuery';
import {useMemberContext} from '../MemberContext';
import {BorrowingActivity} from './BorrowingActivity';
import {OutstandingBorrows} from './OutstandingBorrows';
import {OverviewProvider} from './OverviewContext';
import {PendingReservations} from './PendingReservations';
import {ReadyToClaim} from './ReadyToClaim';
import {ReservationActivity} from './ReservationActivity';
import {TopBorrowedBooks} from './TopBorrowedBooks';
import {TotalBooksBorrowed} from './TotalBooksBorrowed';

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
		<OverviewProvider value={query.data}>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
				<div className="flex min-w-0 flex-col gap-4 sm:col-span-12 xl:col-span-8">
					<div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-8">
						<TotalBooksBorrowed />
						<OutstandingBorrows />
						<div className="flex min-w-0 flex-row gap-3 sm:col-span-8 xl:col-span-2 xl:flex-col [&>*]:flex-1">
							<PendingReservations />
							<ReadyToClaim />
						</div>
					</div>
					<div className="min-w-0 flex-1 [&>section]:h-full">
						<BorrowingActivity />
					</div>
				</div>
				<div className="flex min-w-0 flex-col gap-4 sm:col-span-12 xl:col-span-4">
					<ReservationActivity />
					<div className="min-w-0 flex-1 [&>section]:h-full">
						<TopBorrowedBooks />
					</div>
				</div>
			</div>
		</OverviewProvider>
	);
}
