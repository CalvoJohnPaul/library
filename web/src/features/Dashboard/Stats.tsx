import {ark} from '@ark-ui/react';
import {BookOpenIcon, BookTextIcon, ClockIcon, UsersIcon} from 'lucide-react';
import {cx} from 'tailwind-variants';
import {useDashboardContext} from './DashboardContext';

const ICONS_MAP = {
	books: <BookTextIcon />,
	copies: <BookOpenIcon />,
	members: <UsersIcon />,
	borrows: <ClockIcon />,
};

const ACCENT_MAP = {
	books: cx`border-blue-600/25 bg-blue-600/10 text-blue-700`,
	copies: cx`border-green-600/25 bg-green-600/10 text-green-700`,
	members: cx`border-violet-600/25 bg-violet-600/10 text-violet-700`,
	borrows: cx`border-amber-600/25 bg-amber-600/10 text-amber-700`,
};

export function Stats() {
	const data = useDashboardContext();

	const stats: {
		type: 'books' | 'copies' | 'members' | 'borrows';
		title: string;
		description: string;
		content: string;
	}[] = [
		{
			type: 'books',
			title: 'Total books',
			content: data.totalBooks.toLocaleString(),
			description: `${data.totalBookCopies.toLocaleString()} copies across all titles`,
		},
		{
			type: 'copies',
			title: 'Copies available',
			content: (data.totalBookCopies - data.totalOutstandingBorrows).toLocaleString(),
			description: `${data.totalOutstandingBorrows.toLocaleString()} copies currently borrowed`,
		},
		{
			type: 'members',
			title: 'New members',
			content: data.totalNewMembersThisMonth.toLocaleString(),
			description: 'joined this month',
		},
		{
			type: 'borrows',
			title: 'Outstanding borrows',
			content: data.totalOutstandingBorrows.toLocaleString(),
			description:
				data.totalBookCopies > 0
					? `${((data.totalOutstandingBorrows / data.totalBookCopies) * 100).toFixed(1)}% of all copies`
					: 'No copies yet',
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{stats.map((stat) => {
				return (
					<div key={stat.type} className="rounded-xl border border-gray-200 bg-white p-5">
						<div className="flex items-center justify-between">
							<p className="text-gray-600 text-sm">{stat.title}</p>
							<div
								className={cx(
									'flex size-9 items-center justify-center rounded-full border',
									ACCENT_MAP[stat.type],
								)}
							>
								<ark.svg asChild className="size-4.5">
									{ICONS_MAP[stat.type]}
								</ark.svg>
							</div>
						</div>
						<p className="mt-2 font-bold text-2xl">{stat.content}</p>
						<p className="text-gray-600 text-xs">{stat.description}</p>
					</div>
				);
			})}
		</div>
	);
}
