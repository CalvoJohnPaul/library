import {Portal, Presence} from '@ark-ui/react';
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
import {Tooltip} from '@/components/ui/Tooltip';
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
		icon: UsersIcon,
		label: 'Members',
		href: '/members',
	},
	{
		icon: Calendar1Icon,
		label: 'Reservations',
		href: '/reservations',
	},
	{
		icon: RotateCcwClockIcon,
		label: 'Transactions',
		href: '/transactions',
	},
];

export function Sidebar() {
	const collapsed = useGlobalStore(useShallow((o) => o.sidebarCollapsed));

	return (
		<nav
			className={cx(
				'sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-hidden border-gray-200 border-r font-heading text-gray-700 transition-[width] duration-250 ease-in-out',
				collapsed ? 'w-20' : 'w-56',
			)}
		>
			<ul className="w-full space-y-1 p-4">
				{links.map((link) => (
					<li key={link.href} className="contents">
						<Tooltip.Root
							disabled={!collapsed}
							positioning={{
								placement: 'right',
							}}
						>
							<Tooltip.Trigger asChild>
								<NavLink to={link.href} className={triggerCss}>
									<link.icon className={iconCss} />
									<Presence present={!collapsed} asChild>
										<span className={labelCss}>{link.label}</span>
									</Presence>
								</NavLink>
							</Tooltip.Trigger>
							<Portal>
								<Tooltip.Positioner>
									<Tooltip.Content>
										<Tooltip.Arrow>
											<Tooltip.ArrowTip />
										</Tooltip.Arrow>
										{link.label}
									</Tooltip.Content>
								</Tooltip.Positioner>
							</Portal>
						</Tooltip.Root>
					</li>
				))}

				<li className="contents">
					<Logout
						trigger={
							<Tooltip.Root
								disabled={!collapsed}
								positioning={{
									placement: 'right',
								}}
							>
								<Tooltip.Trigger asChild>
									<button type="button" className={triggerCss}>
										<LogOutIcon className={iconCss} />
										<Presence present={!collapsed} asChild>
											<span className={labelCss}>Log out</span>
										</Presence>
									</button>
								</Tooltip.Trigger>

								<Portal>
									<Tooltip.Positioner>
										<Tooltip.Content>
											<Tooltip.Arrow>
												<Tooltip.ArrowTip />
											</Tooltip.Arrow>
											Log out
										</Tooltip.Content>
									</Tooltip.Positioner>
								</Portal>
							</Tooltip.Root>
						}
					/>
				</li>
			</ul>
		</nav>
	);
}

const triggerCss = cx`flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 font-medium aria-page:text-blue-500`;
const iconCss = cx`size-5 shrink-0`;
const labelCss = cx`ui-closed:animate-fade-out ui-open:animate-fade-in leading-none`;
