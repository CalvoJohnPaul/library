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
	books: cx`border-blue-50 bg-blue-50 text-blue-600 dark:border-blue-950 dark:bg-blue-950 dark:text-blue-300`,
	copies: cx`border-emerald-50 bg-emerald-50 text-emerald-600 dark:border-emerald-950 dark:bg-emerald-950 dark:text-emerald-300`,
	members: cx`border-violet-50 bg-violet-50 text-violet-600 dark:border-violet-950 dark:bg-violet-950 dark:text-violet-300`,
	borrows: cx`border-amber-50 bg-amber-50 text-amber-600 dark:border-amber-950 dark:bg-amber-950 dark:text-amber-300`,
};

const DELTA_BADGE_ACCENTS = {
	up: cx`border-emerald-50 bg-emerald-50 text-emerald-600 dark:border-emerald-950 dark:bg-emerald-950 dark:text-emerald-300`,
	down: cx`border-rose-50 bg-rose-50 text-rose-600 dark:border-rose-950 dark:bg-rose-950 dark:text-rose-300`,
	flat: cx`border-gray-50 bg-gray-50 text-gray-600 dark:border-neutral-950 dark:bg-neutral-900 dark:text-neutral-300`,
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

	const zero = delta.current === 0 && delta.previous === 0;

	const direction = zero ? 'up' : diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
	const Icon = zero
		? TrendingUpIcon
		: diff > 0
			? TrendingUpIcon
			: diff < 0
				? TrendingDownIcon
				: MinusIcon;
	const percent = zero
		? null
		: delta.previous > 0
			? Math.round((diff / delta.previous) * 100)
			: null;
	const text = zero
		? `0% vs last month`
		: percent === null
			? `+${delta.current} ${label}`
			: `${diff >= 0 ? '+' : ''}${percent}% ${label}`;

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
			deltaLabel: 'vs last month',
		},
		{
			type: 'copies',
			title: 'Copies available',
			content: data.totalAvailableCopies.toLocaleString(),
			description: `${data.totalOutstandingBorrows.toLocaleString()} copies currently borrowed`,
			delta: data.monthOverMonth.newCopies,
			deltaLabel: 'vs last month',
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
			deltaLabel: 'vs last month',
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{stats.map((stat) => {
				return (
					<div
						key={stat.type}
						className="rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
					>
						<div className="flex items-center justify-between">
							<p className="text-gray-600 text-sm dark:text-neutral-300">{stat.title}</p>
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
						<p className="mt-2 text-gray-600 text-xs dark:text-neutral-300">{stat.description}</p>
					</div>
				);
			})}
		</div>
	);
}
