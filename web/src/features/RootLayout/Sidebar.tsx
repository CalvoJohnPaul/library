import {ark, Portal, Presence} from '@ark-ui/react';
import {
	BookOpenIcon,
	Calendar1Icon,
	ChartColumnBigIcon,
	LogOutIcon,
	RotateCcwClockIcon,
	UsersIcon,
} from 'lucide-react';
import type {ReactNode} from 'react';
import {NavLink} from 'react-router';
import {twMerge as cx} from 'tailwind-merge';
import {useShallow} from 'zustand/shallow';
import {Tooltip} from '@/components/ui/Tooltip';
import {useGlobalStore} from '@/hooks/useGlobalStore';
import {Logout} from './Logout';
import {Search} from './Search';

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
				'sticky top-16 flex h-[calc(100vh-4rem)] shrink-0 flex-col gap-4 overflow-hidden border-neutral-200 border-r bg-white p-4 font-heading text-neutral-700 transition-[width] duration-250 ease-in-out dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200',
				collapsed ? 'w-20' : 'w-64',
			)}
		>
			<Search />
			<nav className="w-full grow">
				<ul className="w-full space-y-3 px-3">
					{links.map((link) => (
						<li key={link.href} className="block w-full">
							<SidebarLink icon={<link.icon />} label={link.label} href={link.href} />
						</li>
					))}

					<li className="contents">
						<Logout
							trigger={({setOpen}) => (
								<SidebarLink icon={<LogOutIcon />} label="Log out" onClick={() => setOpen(true)} />
							)}
						/>
					</li>
				</ul>
			</nav>
		</nav>
	);
}

function SidebarLink(
	props:
		| {href: string; icon: ReactNode; label: string; onClick?: never}
		| {href?: never; icon: ReactNode; label: string; onClick: () => void},
) {
	const collapsed = useGlobalStore(useShallow((o) => o.sidebarCollapsed));

	const icon = (
		<ark.svg className="size-5 shrink-0" asChild>
			{props.icon}
		</ark.svg>
	);

	const label = (
		<Presence present={!collapsed} asChild>
			<span className="grow ui-closed:animate-fade-out ui-open:animate-fade-in leading-none">
				{props.label}
			</span>
		</Presence>
	);

	return (
		<Tooltip.Root
			disabled={!collapsed}
			positioning={{
				placement: 'right',
			}}
		>
			<Tooltip.Trigger
				asChild
				className="flex w-full items-center gap-2 whitespace-nowrap rounded-md text-left font-medium text-neutral-600 aria-page:text-blue-500 dark:text-neutral-300 dark:aria-page:text-blue-400"
			>
				{props.href ? (
					<NavLink to={props.href}>
						{icon}
						{label}
					</NavLink>
				) : (
					<button type="button" onClick={props.onClick}>
						{icon}
						{label}
					</button>
				)}
			</Tooltip.Trigger>
			<Portal>
				<Tooltip.Positioner>
					<Tooltip.Content>
						<Tooltip.Arrow>
							<Tooltip.ArrowTip />
						</Tooltip.Arrow>
						{props.label}
					</Tooltip.Content>
				</Tooltip.Positioner>
			</Portal>
		</Tooltip.Root>
	);
}
