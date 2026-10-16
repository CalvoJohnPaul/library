import {useStatsQuery} from '@/hooks/useStatsQuery';
import {BooksByGenre} from './BooksByGenre';
import {BorrowingActivity} from './BorrowingActivity';
import {DashboardProvider} from './DashboardContext';
import {Stats} from './Stats';
import {TopBorrowedBooks} from './TopBorrowedBooks';

export function Dashboard() {
	const query = useStatsQuery({
		placeholderData: {
			last14DaysActivity: [],
			topBorrowedBooksThisMonth: [],
			totalBookCopies: 0,
			totalBookCopiesByGenre: [],
			totalBooks: 0,
			totalNewMembersThisMonth: 0,
			totalOutstandingBorrows: 0,
		},
	});

	if (!query.data) return null;

	return (
		<DashboardProvider value={query.data}>
			<title>read. | Dashboard</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Dashboard</h1>
					<p className="text-gray-600 text-sm">View an overview of your library at a glance.</p>
				</div>
			</div>
			<div className="flex flex-col gap-4">
				<Stats />
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
					<BorrowingActivity />
					<BooksByGenre />
				</div>
				<TopBorrowedBooks />
			</div>
		</DashboardProvider>
	);
}
