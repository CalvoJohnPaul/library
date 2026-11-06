import type {BookGenre} from '@library/types';
import {useState} from 'react';
import {useStatsQuery} from '@/hooks/useStatsQuery';
import {BooksByGenre} from './BooksByGenre';
import {BorrowingActivity} from './BorrowingActivity';
import {DashboardProvider} from './DashboardContext';
import {PendingReservations} from './PendingReservations';
import {ReadyToClaim} from './ReadyToClaim';
import {ReservationActivity} from './ReservationActivity';
import {Stats} from './Stats';
import {TopBorrowedBooks} from './TopBorrowedBooks';
import {TopBorrowingMembers} from './TopBorrowingMembers';

export function Dashboard() {
	const [genre, setGenre] = useState<BookGenre | null>(null);
	const query = useStatsQuery({
		placeholderData: {
			last14DaysActivity: [],
			last7DaysReservationActivity: [],
			monthOverMonth: {
				borrows: {current: 0, previous: 0},
				newBooks: {current: 0, previous: 0},
				newCopies: {current: 0, previous: 0},
				newMembers: {current: 0, previous: 0},
			},
			topBorrowedBooksThisMonth: [],
			topBorrowedMembersThisMonth: [],
			totalBookCopies: 0,
			totalAvailableCopies: 0,
			totalBookCopiesByGenre: [],
			totalBooks: 0,
			totalOutstandingBorrows: 0,
			totalPendingReservations: 0,
			totalReadyToClaimReservations: 0,
		},
	});

	if (!query.data) return null;

	return (
		<DashboardProvider value={query.data}>
			<title>Dashboard | USAT</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Dashboard</h1>
					<p className="text-neutral-600 text-sm dark:text-neutral-300">
						View an overview of your library at a glance.
					</p>
				</div>
			</div>
			<div className="flex flex-col gap-4">
				<Stats />
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
					<div className="grid min-w-0 gap-4 xl:col-span-2 xl:grid-rows-2">
						<BorrowingActivity />
						<TopBorrowedBooks genre={genre} onGenreChange={setGenre} />
					</div>
					<div className="flex min-w-0 flex-col gap-4">
						<BooksByGenre genre={genre} onGenreChange={setGenre} />
						<TopBorrowingMembers />
						<div className="grid min-w-0 grid-cols-2 gap-4">
							<PendingReservations />
							<ReadyToClaim />
						</div>
						<ReservationActivity />
					</div>
				</div>
			</div>
		</DashboardProvider>
	);
}
