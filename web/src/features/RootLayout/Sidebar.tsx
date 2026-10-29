import {Presence} from '@ark-ui/react';
import {
	BookOpenIcon,
	Calendar1Icon,
	ChartColumnBigIcon,
	LogOutIcon,
	RotateCcwClockIcon,
	UsersIcon,
} from 'lucide-react';
import {NavLink, useNavigate} from 'react-router';
import {useShallow} from 'zustand/shallow';
import {useDestroySessionMutation} from '@/hooks/useDestroySessionMutation';
import {useGlobalStore} from '@/hooks/useGlobalStore';
import {useMeQuery} from '@/hooks/useMeQuery';
import {client} from '@/utils/client';

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
	const navigate = useNavigate();
	const mutation = useDestroySessionMutation({
		onSuccess() {
			client
				.invalidateQueries({queryKey: useMeQuery.getQueryKey()})
				.then(() => {
					navigate('/');
				})
				.catch(console.error);
		},
	});

	const hidden = useGlobalStore(useShallow((o) => o.sidebarHidden));
	const cssVars: Record<string, string | number> = {
		'--width': '224px',
	};

	return (
		<Presence present={!hidden} lazyMount skipAnimationOnMount asChild>
			<nav
				className="sticky top-16 h-[calc(100vh-4rem)] shrink-0 ui-closed:animate-collapse-x-out ui-open:animate-collapse-x-in overflow-hidden border-gray-200 border-r font-heading text-gray-700"
				style={cssVars}
			>
				<ul className="w-56 space-y-1 p-4">
					{links.map((link) => (
						<li key={link.href} className="contents">
							<NavLink
								to={link.href}
								className="flex w-full items-center gap-2 rounded-md px-3 py-2 font-medium aria-page:text-blue-500"
							>
								<link.icon className="size-5" />
								{link.label}
							</NavLink>
						</li>
					))}

					<li className="contents">
						<button
							type="button"
							className="flex w-full items-center gap-2 rounded-md px-3 py-2 font-medium"
							disabled={mutation.isPending}
							onClick={() => {
								mutation.mutate();
							}}
						>
							<LogOutIcon className="size-5" />
							Log out
						</button>
					</li>
				</ul>
			</nav>
		</Presence>
	);
}
