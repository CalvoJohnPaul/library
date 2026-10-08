import {ActivityChart} from './ActivityChart';
import {DashboardCard} from './DashboardCard';
import {GenreChart} from './GenreChart';
import {activity, genres, stats, topBooks} from './mockData';
import {RankingChart} from './RankingChart';
import {StatCards} from './StatCards';

export function Dashboard() {
	return (
		<>
			<title>read. | Dashboard</title>
			<div className="mb-6 flex items-center gap-3">
				<div className="grow">
					<h1 className="font-bold text-xl">Dashboard</h1>
					<p className="text-gray-600 text-sm">View an overview of your library at a glance.</p>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<StatCards stats={stats} />

				<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
					<DashboardCard
						title="Borrowing activity"
						subtitle="Borrowed and returned copies over the last 14 days"
						className="xl:col-span-2"
					>
						<ActivityChart activity={activity} />
					</DashboardCard>

					<DashboardCard title="Books by genre" subtitle="Distribution across the catalog">
						<GenreChart genres={genres} />
					</DashboardCard>
				</div>

				<DashboardCard title="Top borrowed books" subtitle="Most borrowed of all time">
					<RankingChart
						items={topBooks.map((book) => ({name: book.title, count: book.count}))}
						color="var(--color-blue-500)"
						unitLabel="borrows"
					/>
				</DashboardCard>
			</div>
		</>
	);
}
