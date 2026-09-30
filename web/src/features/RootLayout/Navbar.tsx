import {ark, Portal} from '@ark-ui/react';
import {
	BookOpenIcon,
	LockKeyholeIcon,
	LogOutIcon,
	RotateCcwClockIcon,
	SettingsIcon,
	SquarePenIcon,
	UsersIcon,
} from 'lucide-react';
import {NavLink} from 'react-router';
import {cx} from 'tailwind-variants';
import {Avatar} from '@/components/ui/Avatar';
import {Menu} from '@/components/ui/Menu';
import {Tooltip} from '@/components/ui/Tooltip';
import {useDestroySessionMutation} from '@/hooks/useDestroySessionMutation';
import {useMeQuery} from '@/hooks/useMeQuery';
import {client} from '@/utils/client';

export function Navbar() {
	const query = useMeQuery();
	const links = [
		{
			icon: <BookOpenIcon />,
			label: 'Books',
			href: '/books',
		},
		{
			icon: <RotateCcwClockIcon />,
			label: 'Transactions',
			href: '/transactions',
		},
		{
			icon: <UsersIcon />,
			label: 'Students',
			href: '/students',
		},
	];

	return (
		<header className="flex h-16 items-center border-gray-200 border-b px-12">
			<h2 className="logo-shine block font-extrabold text-xl tracking-wider">read.</h2>
			<div className="grow"></div>
			<nav className="flex gap-1">
				<ul className="contents">
					{links.map((link) => (
						<li key={link.href} className="contents">
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<NavLink
										to={link.href}
										className="block px-2 py-2 text-gray-600 aria-page:font-medium aria-page:text-blue-500"
									>
										<ark.svg asChild className="size-5.5">
											{link.icon}
										</ark.svg>
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
						<Menu.Root ids={{trigger: 'settings-trigger'}}>
							<Menu.Context>
								{(api) => (
									<Tooltip.Root ids={{trigger: 'settings-trigger'}} disabled={api.open}>
										<Tooltip.Trigger
											onClick={() => {
												api.setOpen(!api.open);
											}}
											disabled={query.isPending}
											className={cx(
												'block px-2 py-2 text-gray-600 aria-page:font-medium',
												api.open && 'text-blue-500',
											)}
										>
											<SettingsIcon className="size-5.5" />
										</Tooltip.Trigger>

										<Portal>
											<Tooltip.Positioner>
												<Tooltip.Content>
													<Tooltip.Arrow>
														<Tooltip.ArrowTip />
													</Tooltip.Arrow>
													Settings
												</Tooltip.Content>
											</Tooltip.Positioner>
										</Portal>
									</Tooltip.Root>
								)}
							</Menu.Context>

							<Portal>
								<Menu.Positioner>
									<Menu.Content>
										<div className="flex items-center gap-2 py-2 pr-4 pl-2">
											<Avatar.Root>
												<Avatar.Fallback />
											</Avatar.Root>
											<div>
												<p className="font-semibold leading-tight">{query.data?.name}</p>
												<p className="text-gray-600 text-sm leading-tight">{query.data?.email}</p>
											</div>
										</div>
										<Menu.Separator />
										<Menu.Item value="edit-account">
											<SquarePenIcon />
											Edit account
										</Menu.Item>
										<Menu.Item value="change-password">
											<LockKeyholeIcon />
											Change password
										</Menu.Item>
										<Menu.Separator />
										<Logout />
									</Menu.Content>
								</Menu.Positioner>
							</Portal>
						</Menu.Root>
					</li>
				</ul>
			</nav>
		</header>
	);
}

function Logout() {
	const mutation = useDestroySessionMutation({
		onSuccess() {
			client.invalidateQueries({
				queryKey: useMeQuery.getQueryKey(),
			});
		},
	});

	return (
		<Menu.Item
			value="logout"
			disabled={mutation.isPending}
			onSelect={() => {
				mutation.mutate();
			}}
		>
			<LogOutIcon />
			Log out
		</Menu.Item>
	);
}
