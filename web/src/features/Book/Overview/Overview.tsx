import {BookOpenIcon, ClockIcon} from 'lucide-react';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Stat} from '@/components/ui/Stat';
import {useBookStatsQuery} from '@/hooks/useBookStatsQuery';
import {useBookContext} from '../BookContext';
import {BorrowingActivity} from './BorrowingActivity';
import {DeltaBadge} from './DeltaBadge';
import {OverviewProvider} from './OverviewContext';
import {PendingReservations} from './PendingReservations';
import {ReadyToClaim} from './ReadyToClaim';
import {ReservationActivity} from './ReservationActivity';
import {TopBorrowingMembers} from './TopBorrowingMembers';

export function Overview() {
	const book = useBookContext();
	const query = useBookStatsQuery(book.id);

	if (query.isPending) {
		return (
			<div className="flex items-center gap-1.5">
				<SpinnerIcon className="size-4.5 text-blue-500 dark:text-blue-400" />
				<span className="text-neutral-600 dark:text-neutral-300">Loading.</span>
			</div>
		);
	}

	if (query.isError) {
		return <p className="text-red-500 text-sm">Unable to load book statistics.</p>;
	}

	const data = query.data;

	return (
		<OverviewProvider value={data}>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
				<div className="flex min-w-0 flex-col gap-4 sm:col-span-12 xl:col-span-8">
					<div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-8">
						<Stat.Root size="md" accent="success" className="sm:col-span-4 xl:col-span-3">
							<Stat.Label>Copies available</Stat.Label>
							<Stat.Icon>
								<BookOpenIcon />
							</Stat.Icon>
							<Stat.ValueText>{data.totalAvailableCopies.toLocaleString()}</Stat.ValueText>
							<DeltaBadge delta={data.monthOverMonth.newCopies} />
							<Stat.HelpText>
								{data.totalOutstandingBorrows.toLocaleString()} copies currently borrowed
							</Stat.HelpText>
						</Stat.Root>
						<Stat.Root size="md" accent="warning" className="sm:col-span-4 xl:col-span-3">
							<Stat.Label>Outstanding borrows</Stat.Label>
							<Stat.Icon>
								<ClockIcon />
							</Stat.Icon>
							<Stat.ValueText>{data.totalOutstandingBorrows.toLocaleString()}</Stat.ValueText>
							<DeltaBadge delta={data.monthOverMonth.borrows} />
							<Stat.HelpText>
								{data.totalBookCopies > 0
									? `${((data.totalOutstandingBorrows / data.totalBookCopies) * 100).toFixed(1)}% of all copies`
									: 'No copies yet'}
							</Stat.HelpText>
						</Stat.Root>
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
						<TopBorrowingMembers />
					</div>
				</div>
			</div>
		</OverviewProvider>
	);
}
