import {BookOpenIcon, BookTextIcon, ClockIcon, UsersIcon} from 'lucide-react';
import type {ComponentType} from 'react';
import type {Stat} from './mockData';

const statIcons: Record<Stat['icon'], ComponentType<{className?: string}>> = {
	books: BookTextIcon,
	copies: BookOpenIcon,
	members: UsersIcon,
	borrows: ClockIcon,
};

const statAccents: Record<Stat['icon'], string> = {
	books: 'border-blue-600/25 bg-blue-600/10 text-blue-700',
	copies: 'border-green-600/25 bg-green-600/10 text-green-700',
	members: 'border-violet-600/25 bg-violet-600/10 text-violet-700',
	borrows: 'border-amber-600/25 bg-amber-600/10 text-amber-700',
};

interface StatCardsProps {
	stats: Stat[];
}

export function StatCards({stats}: StatCardsProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{stats.map((stat) => {
				const Icon = statIcons[stat.icon];

				return (
					<div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
						<div className="flex items-center justify-between">
							<p className="text-gray-600 text-sm">{stat.label}</p>
							<div
								className={`flex size-9 items-center justify-center rounded-full border ${statAccents[stat.icon]}`}
							>
								<Icon className="size-4.5" />
							</div>
						</div>
						<p className="mt-2 font-bold text-2xl">{stat.value}</p>
						<p className="text-gray-600 text-xs">{stat.sub}</p>
					</div>
				);
			})}
		</div>
	);
}
