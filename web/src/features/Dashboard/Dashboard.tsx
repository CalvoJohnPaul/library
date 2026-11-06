import type {BookGenre} from '@library/types';
import {
	BookOpenIcon,
	BookTextIcon,
	CalendarClockIcon,
	CircleCheckIcon,
	ClockIcon,
	UsersIcon,
} from 'lucide-react';
import {useState} from 'react';
import {Stat} from '@/components/ui/Stat';
import {useStatsQuery} from '@/hooks/useStatsQuery';
import {BorrowingActivity} from '@/templates/BorrowingActivity';
import {DeltaBadge} from '@/templates/DeltaBadge';
import {ReservationActivity} from '@/templates/ReservationActivity';
import {TopBorrowedBooks} from '@/templates/TopBorrowedBooks';
import {TopBorrowingMembers} from '@/templates/TopBorrowingMembers';
import {BooksByGenre} from './BooksByGenre';
import {DashboardProvider} from './DashboardContext';

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
			topBorrowedBooksLast30Days: [],
			topBorrowedMembersLast30Days: [],
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
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<Stat.Root size="md" accent="info">
						<Stat.Label>Total books</Stat.Label>
						<Stat.Icon>
							<BookTextIcon />
						</Stat.Icon>
						<Stat.ValueText>{query.data.totalBooks.toLocaleString()}</Stat.ValueText>
						<DeltaBadge delta={query.data.monthOverMonth.newBooks} />
						<Stat.HelpText>
							{query.data.totalBookCopies.toLocaleString()} copies across all titles
						</Stat.HelpText>
					</Stat.Root>
					<Stat.Root size="md" accent="success">
						<Stat.Label>Copies available</Stat.Label>
						<Stat.Icon>
							<BookOpenIcon />
						</Stat.Icon>
						<Stat.ValueText>{query.data.totalAvailableCopies.toLocaleString()}</Stat.ValueText>
						<DeltaBadge delta={query.data.monthOverMonth.newCopies} />
						<Stat.HelpText>
							{query.data.totalOutstandingBorrows.toLocaleString()} copies currently borrowed
						</Stat.HelpText>
					</Stat.Root>
					<Stat.Root size="md" accent="purple">
						<Stat.Label>New members</Stat.Label>
						<Stat.Icon>
							<UsersIcon />
						</Stat.Icon>
						<Stat.ValueText>
							{query.data.monthOverMonth.newMembers.current.toLocaleString()}
						</Stat.ValueText>
						<DeltaBadge delta={query.data.monthOverMonth.newMembers} />
						<Stat.HelpText>joined this month</Stat.HelpText>
					</Stat.Root>
					<Stat.Root size="md" accent="warning">
						<Stat.Label>Outstanding borrows</Stat.Label>
						<Stat.Icon>
							<ClockIcon />
						</Stat.Icon>
						<Stat.ValueText>{query.data.totalOutstandingBorrows.toLocaleString()}</Stat.ValueText>
						<DeltaBadge delta={query.data.monthOverMonth.borrows} />
						<Stat.HelpText>
							{query.data.totalBookCopies > 0
								? `${((query.data.totalOutstandingBorrows / query.data.totalBookCopies) * 100).toFixed(1)}% of all copies`
								: 'No copies yet'}
						</Stat.HelpText>
					</Stat.Root>
				</div>
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
					<div className="grid min-w-0 gap-4 xl:col-span-2 xl:grid-rows-2">
						<BorrowingActivity data={query.data.last14DaysActivity} />
						<TopBorrowedBooks
							data={query.data.topBorrowedBooksLast30Days}
							numOfDays={30}
							genre={genre}
							onGenreChange={setGenre}
						/>
					</div>
					<div className="flex min-w-0 flex-col gap-4">
						<BooksByGenre genre={genre} onGenreChange={setGenre} />
						<TopBorrowingMembers data={query.data.topBorrowedMembersLast30Days} numOfDays={30} />
						<div className="grid min-w-0 grid-cols-2 gap-4">
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
						<ReservationActivity data={query.data.last7DaysReservationActivity} />
					</div>
				</div>
			</div>
		</DashboardProvider>
	);
}
