import {
	BookOpenIcon,
	Calendar1Icon,
	ChartColumnBigIcon,
	LogOutIcon,
	RotateCcwClockIcon,
	UsersIcon,
} from 'lucide-react';
import {NavLink} from 'react-router';
import {twMerge as cx} from 'tailwind-merge';
import {useShallow} from 'zustand/shallow';
import {useGlobalStore} from '@/hooks/useGlobalStore';
import {Logout} from '@/templates/Logout';

const links = [
	{
		icon: ChartColumnBigIcon,
		label: 'Dashboard',
		href: '/',
	},
	{
		icon: BookOpenIcon,
		label: 'Books',
		href: '/books',
	},
	{
		icon: RotateCcwClockIcon,
		label: 'Transactions',
		href: '/transactions',
	},
	{
		icon: UsersIcon,
		label: 'Members',
		href: '/members',
	},
	{
		icon: Calendar1Icon,
		label: 'Reservations',
		href: '/reservations',
	},
];

export function Sidebar() {
	const collapsed = useGlobalStore(useShallow((o) => o.sidebarCollapsed));

	return (
		<nav
			className={cx(
				'sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-hidden border-gray-200 border-r font-heading text-gray-700 transition-[width] duration-300 ease-in-out',
				collapsed ? 'w-20' : 'w-56',
			)}
		>
			<ul className="w-56 space-y-1 p-4">
				{links.map((link) => (
					<li key={link.href} className="contents">
						<NavLink
							to={link.href}
							title={collapsed ? link.label : undefined}
							className="flex w-full items-center gap-2 rounded-md px-3 py-2 font-medium aria-page:text-blue-500"
						>
							<link.icon className="size-5 shrink-0" />
							<span
								className={cx(
									'transition-opacity duration-150',
									collapsed ? 'opacity-0' : 'opacity-100',
								)}
							>
								{link.label}
							</span>
						</NavLink>
					</li>
				))}

				<li className="contents">
					<Logout
						trigger={
							<button
								type="button"
								title={collapsed ? 'Log out' : undefined}
								className="flex w-full items-center gap-2 rounded-md px-3 py-2 font-medium"
							>
								<LogOutIcon className="size-5 shrink-0" />
								<span
									className={cx(
										'transition-opacity duration-150',
										collapsed ? 'opacity-0' : 'opacity-100',
									)}
								>
									Log out
								</span>
							</button>
						}
					/>
				</li>
			</ul>
		</nav>
	);
}
