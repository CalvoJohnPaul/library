import type {BookGenre} from '@library/types';
import {useState} from 'react';
import {useStatsQuery} from '@/hooks/useStatsQuery';
import {BooksByGenre} from './BooksByGenre';
import {BorrowingActivity} from './BorrowingActivity';
import {DashboardProvider} from './DashboardContext';
import {Stats} from './Stats';
import {TopBorrowedBooks} from './TopBorrowedBooks';
import {TopBorrowingMembers} from './TopBorrowingMembers';

export function Dashboard() {
	const [genre, setGenre] = useState<BookGenre | null>(null);
	const query = useStatsQuery({
		placeholderData: {
			last14DaysActivity: [],
			monthOverMonth: {
				borrows: {current: 0, previous: 0},
				newBooks: {current: 0, previous: 0},
				newCopies: {current: 0, previous: 0},
				newMembers: {current: 0, previous: 0},
			},
			topBorrowedBooksThisMonth: [],
			topBorrowedMembersThisMonth: [],
			totalBookCopies: 0,
			totalBookCopiesByGenre: [],
			totalBooks: 0,
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
					<BooksByGenre genre={genre} onGenreChange={setGenre} />
					<TopBorrowedBooks genre={genre} onGenreChange={setGenre} />
					<TopBorrowingMembers />
				</div>
			</div>
		</DashboardProvider>
	);
}
