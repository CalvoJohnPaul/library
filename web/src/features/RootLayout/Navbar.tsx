import {funEmoji} from '@dicebear/collection';
import {createAvatar} from '@dicebear/core';
import {LogOutIcon, MenuIcon} from 'lucide-react';
import {Link} from 'react-router';
import {useShallow} from 'zustand/shallow';
import {Avatar} from '@/components/ui/Avatar';
import {Menu} from '@/components/ui/Menu';
import {useGlobalStore} from '@/hooks/useGlobalStore';
import {useMeQuery} from '@/hooks/useMeQuery';
import {ChangePassword} from './ChangePassword';
import {EditAccount} from './EditAccount';
import {Logout} from './Logout';
import {ThemeToggle} from './ThemeToggle';

export function Navbar() {
	const query = useMeQuery();
	const avatar = query.data
		? createAvatar(funEmoji, {seed: query.data.id.toString()}).toDataUri()
		: '';

	const [sidebarCollapsed, setSidebarCollapsed] = useGlobalStore(
		useShallow((o) => [o.sidebarCollapsed, o.setSidebarCollapsed]),
	);

	return (
		<header className="sticky top-0 z-sticky grid h-16 grid-cols-3 items-center gap-3 border-neutral-200 border-b bg-white pr-12 pl-7 dark:border-neutral-800 dark:bg-neutral-950">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => {
						setSidebarCollapsed((prev) => !prev);
					}}
					className="text-neutral-700 dark:text-neutral-200"
					data-state={sidebarCollapsed ? 'closed' : 'open'}
				>
					<MenuIcon className="size-5" />
				</button>
				<Link to="/" className="block">
					<h2 className="logo-shine dark:logo-shine-dark block font-bold font-heading text-xl tracking-wider">
						USAT
					</h2>
				</Link>
			</div>
			<div />
			<div className="flex justify-end gap-3">
				<ThemeToggle />
				<Menu.Root ids={{trigger: 'settings-trigger'}}>
					<Menu.Trigger disabled={query.isLoading}>
						<Avatar.Root size="sm">
							<Avatar.Image src={avatar} />
							<Avatar.Fallback />
						</Avatar.Root>
					</Menu.Trigger>

					<Menu.Positioner>
						<Menu.Content>
							<div className="flex items-center gap-2 py-2 pr-4 pl-2">
								<Avatar.Root>
									<Avatar.Image src={avatar} />
									<Avatar.Fallback />
								</Avatar.Root>
								<div>
									<p className="font-semibold leading-tight">{query.data?.name}</p>
									<p className="text-neutral-600 text-sm leading-tight dark:text-neutral-300">
										{query.data?.email}
									</p>
								</div>
							</div>
							<Menu.Separator />
							<EditAccount />
							<ChangePassword />
							<Menu.Separator />
							<Logout
								trigger={({setOpen}) => (
									<Menu.Item
										value="logout"
										onSelect={() => {
											setOpen(true);
										}}
									>
										<LogOutIcon />
										Log out
									</Menu.Item>
								)}
							/>
						</Menu.Content>
					</Menu.Positioner>
				</Menu.Root>
			</div>
		</header>
	);
}
