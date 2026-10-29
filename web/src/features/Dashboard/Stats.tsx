import {ark} from '@ark-ui/react';
import {
	BookOpenIcon,
	BookTextIcon,
	ClockIcon,
	MinusIcon,
	TrendingDownIcon,
	TrendingUpIcon,
	UsersIcon,
} from 'lucide-react';
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

const DELTA_BADGE_ACCENTS = {
	up: cx`border-emerald-600/25 bg-emerald-600/10 text-emerald-700`,
	down: cx`border-rose-600/25 bg-rose-600/10 text-rose-700`,
	flat: cx`border-gray-600/25 bg-gray-600/10 text-gray-700`,
};

function DeltaBadge({
	className,
	delta,
	label,
}: {
	className?: string;
	delta: {current: number; previous: number};
	label: string;
}) {
	const diff = delta.current - delta.previous;

	if (delta.current === 0 && delta.previous === 0) return null;

	const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
	const Icon = diff > 0 ? TrendingUpIcon : diff < 0 ? TrendingDownIcon : MinusIcon;
	const percent = delta.previous > 0 ? Math.round((diff / delta.previous) * 100) : null;
	const text =
		percent === null ? `+${delta.current} ${label}` : `${diff >= 0 ? '+' : ''}${percent}% ${label}`;

	return (
		<span
			className={cx(
				'flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 font-medium text-xs',
				DELTA_BADGE_ACCENTS[direction],
				className,
			)}
		>
			<ark.svg asChild className="size-3">
				<Icon />
			</ark.svg>
			{text}
		</span>
	);
}

export function Stats() {
	const data = useDashboardContext();

	const stats: {
		type: 'books' | 'copies' | 'members' | 'borrows';
		title: string;
		description: string;
		content: string;
		delta: {current: number; previous: number};
		deltaLabel: string;
	}[] = [
		{
			type: 'books',
			title: 'Total books',
			content: data.totalBooks.toLocaleString(),
			description: `${data.totalBookCopies.toLocaleString()} copies across all titles`,
			delta: data.monthOverMonth.newBooks,
			deltaLabel: 'new titles this month',
		},
		{
			type: 'copies',
			title: 'Copies available',
			content: data.totalAvailableCopies.toLocaleString(),
			description: `${data.totalOutstandingBorrows.toLocaleString()} copies currently borrowed`,
			delta: data.monthOverMonth.newCopies,
			deltaLabel: 'copies added this month',
		},
		{
			type: 'members',
			title: 'New members',
			content: data.monthOverMonth.newMembers.current.toLocaleString(),
			description: 'joined this month',
			delta: data.monthOverMonth.newMembers,
			deltaLabel: 'vs last month',
		},
		{
			type: 'borrows',
			title: 'Outstanding borrows',
			content: data.totalOutstandingBorrows.toLocaleString(),
			description:
				data.totalBookCopies > 0
					? `${((data.totalOutstandingBorrows / data.totalBookCopies) * 100).toFixed(1)}% of all copies`
					: 'No copies yet',
			delta: data.monthOverMonth.borrows,
			deltaLabel: 'borrow activity vs last month',
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
						<DeltaBadge className="mt-2" delta={stat.delta} label={stat.deltaLabel} />
						<p className="mt-2 text-gray-600 text-xs">{stat.description}</p>
					</div>
				);
			})}
		</div>
	);
}
