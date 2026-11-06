import type {StatsMonthOverMonthDelta} from '@library/types';
import {BookOpenIcon, BookTextIcon, ClockIcon, UsersIcon} from 'lucide-react';
import {Stat} from '@/components/ui/Stat';
import {useDashboardContext} from './DashboardContext';

const ICONS_MAP = {
	books: <BookTextIcon />,
	copies: <BookOpenIcon />,
	members: <UsersIcon />,
	borrows: <ClockIcon />,
};

const ACCENT_MAP = {
	books: 'info',
	copies: 'success',
	members: 'purple',
	borrows: 'warning',
} as const;

export function DeltaBadge({
	className,
	delta,
}: {
	className?: string;
	delta: StatsMonthOverMonthDelta;
}) {
	const diff = delta.current - delta.previous;

	const zero = delta.current === 0 && delta.previous === 0;

	const direction = zero ? 'up' : diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
	const percent = zero
		? null
		: delta.previous > 0
			? Math.round((diff / delta.previous) * 100)
			: null;
	const text = zero
		? `0% vs last month`
		: percent === null
			? `+${delta.current} vs last month`
			: `${diff >= 0 ? '+' : ''}${percent}% vs last month`;

	return (
		<Stat.Badge direction={direction} className={className}>
			<Stat.BadgeIcon />
			<Stat.BadgeLabel>{text}</Stat.BadgeLabel>
		</Stat.Badge>
	);
}

export function Stats() {
	const data = useDashboardContext();

	const stats: {
		type: 'books' | 'copies' | 'members' | 'borrows';
		title: string;
		description: string;
		content: string;
		delta: StatsMonthOverMonthDelta;
	}[] = [
		{
			type: 'books',
			title: 'Total books',
			content: data.totalBooks.toLocaleString(),
			description: `${data.totalBookCopies.toLocaleString()} copies across all titles`,
			delta: data.monthOverMonth.newBooks,
		},
		{
			type: 'copies',
			title: 'Copies available',
			content: data.totalAvailableCopies.toLocaleString(),
			description: `${data.totalOutstandingBorrows.toLocaleString()} copies currently borrowed`,
			delta: data.monthOverMonth.newCopies,
		},
		{
			type: 'members',
			title: 'New members',
			content: data.monthOverMonth.newMembers.current.toLocaleString(),
			description: 'joined this month',
			delta: data.monthOverMonth.newMembers,
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
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{stats.map((stat) => {
				return (
					<Stat.Root key={stat.type} size="md" accent={ACCENT_MAP[stat.type]}>
						<Stat.Label>{stat.title}</Stat.Label>
						<Stat.Icon>{ICONS_MAP[stat.type]}</Stat.Icon>
						<Stat.ValueText>{stat.content}</Stat.ValueText>
						<DeltaBadge delta={stat.delta} />
						<Stat.HelpText>{stat.description}</Stat.HelpText>
					</Stat.Root>
				);
			})}
		</div>
	);
}
