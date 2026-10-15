import {useStatsQuery} from '@/hooks/useStatsQuery';
import {ActivityChart} from './ActivityChart';
import {DashboardCard} from './DashboardCard';
import {DashboardProvider} from './DashboardContext';
import {GenreChart} from './GenreChart';
import {RankingChart} from './RankingChart';
import {StatCards} from './StatCards';

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
				<StatCards />
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
					<DashboardCard
						title="Borrowing activity"
						subtitle="Borrowed and returned copies over the last 14 days"
						className="xl:col-span-2"
					>
						<ActivityChart />
					</DashboardCard>
					<DashboardCard title="Books by genre" subtitle="Distribution across the catalog">
						<GenreChart />
					</DashboardCard>
				</div>
				<DashboardCard title="Top borrowed books" subtitle="Most borrowed this month">
					<RankingChart />
				</DashboardCard>
			</div>
		</DashboardProvider>
	);
}
