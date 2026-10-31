import {ark, Portal, Presence, useDialogContext, useHotkey} from '@ark-ui/react';
import type {SearchResult} from '@library/types';
import {useDebouncedValue} from '@tanstack/react-pacer';
import {
	BookOpenIcon,
	Calendar1Icon,
	ChartColumnBigIcon,
	LogOutIcon,
	RotateCcwClockIcon,
	SearchIcon,
	UsersIcon,
} from 'lucide-react';
import {type ReactNode, useEffect, useRef, useState} from 'react';
import {NavLink, useNavigate} from 'react-router';
import {twMerge as cx} from 'tailwind-merge';
import {useShallow} from 'zustand/shallow';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Dialog} from '@/components/ui/Dialog';
import {Field} from '@/components/ui/Field';
import {Tooltip} from '@/components/ui/Tooltip';
import {useGlobalStore} from '@/hooks/useGlobalStore';
import {useSearchQuery} from '@/hooks/useSearchQuery';
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
				'sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-hidden border-gray-200 border-r bg-white p-4 font-heading text-gray-700 transition-[width] duration-250 ease-in-out dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200',
				collapsed ? 'w-20' : 'w-64',
			)}
		>
			<Search />

			<ul className="mt-4 w-full space-y-3 px-3">
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
				className="flex w-full items-center gap-2 whitespace-nowrap rounded-md text-left font-medium text-gray-600 aria-page:text-blue-500 dark:text-neutral-300 dark:aria-page:text-blue-400"
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

function Search() {
	const collapsed = useGlobalStore(useShallow((o) => o.sidebarCollapsed));

	const [open, setOpen] = useState(false);
	const [input, setInput] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const search = input.trim();
	const [debouncedSearch] = useDebouncedValue(search, {wait: 300});
	const query = useSearchQuery(debouncedSearch, {
		enabled: open && search === debouncedSearch,
	});

	useHotkey({
		enabled: !open,
		hotkey: 'ctrl+k',
		action() {
			setOpen(true);
		},
	});

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(details) => {
				setOpen(details.open);
			}}
			initialFocusEl={() => inputRef.current}
			closeOnEscape
			onExitComplete={() => {
				setInput('');
			}}
		>
			<Tooltip.Root
				disabled={!collapsed}
				positioning={{
					placement: 'right',
				}}
			>
				<Tooltip.Trigger asChild>
					<Dialog.Trigger className="flex h-11 w-full items-center gap-2 overflow-hidden whitespace-nowrap rounded-md border border-gray-200 px-3 text-left dark:border-neutral-700">
						<SearchIcon className="size-5 shrink-0 text-gray-500 dark:text-neutral-400" />
						<Presence
							present={!collapsed}
							className="flex grow ui-closed:animate-fade-out ui-open:animate-fade-in items-center leading-none"
						>
							<span className="grow text-gray-400 dark:text-neutral-500">Search</span>
							<span className="rounded font-mono text-gray-600 text-xs tracking-tighter dark:text-neutral-300">
								Ctrl K
							</span>
						</Presence>
					</Dialog.Trigger>
				</Tooltip.Trigger>

				<Portal>
					<Tooltip.Positioner>
						<Tooltip.Content>
							<Tooltip.Arrow>
								<Tooltip.ArrowTip />
							</Tooltip.Arrow>
							Search
						</Tooltip.Content>
					</Tooltip.Positioner>
				</Portal>
			</Tooltip.Root>

			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner className="items-start p-4 pt-24">
					<Dialog.Content className="max-w-2xl">
						<Dialog.Header className="pb-4">
							<div>
								<Dialog.Title>Search</Dialog.Title>
								<Dialog.Description>Find books, members, and tickets.</Dialog.Description>
							</div>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body className="pb-6">
							<Field.Root className="relative">
								<SearchIcon className="pointer-events-none absolute top-3 left-3 size-5 text-gray-500 dark:text-neutral-400" />
								<Field.Input
									ref={inputRef}
									type="search"
									placeholder="Search"
									value={input}
									onChange={(event) => setInput(event.target.value)}
									className="pl-10"
								/>
							</Field.Root>

							<div className="mt-5">
								{!search ? (
									<p className="text-center text-gray-500 text-sm dark:text-neutral-400">
										Start typing to search the library.
									</p>
								) : search !== debouncedSearch || query.isPending || query.isFetching ? (
									<div role="status" className="flex justify-center">
										<SpinnerIcon className="size-5 text-gray-500 dark:text-neutral-400" />
										<span className="sr-only">Searching</span>
									</div>
								) : query.data?.length ? (
									<ul className="h-auto max-h-84 space-y-1.5 overflow-y-auto">
										{query.data.map((result) => (
											<li key={`${result.type}:${result.data.id}`} className="block w-full">
												<SearchResultLink result={result} />
											</li>
										))}
									</ul>
								) : (
									<p className="text-center text-gray-500 text-sm dark:text-neutral-400">
										No results found.
									</p>
								)}
							</div>
						</Dialog.Body>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}

function SearchResultLink({result}: {result: SearchResult}) {
	const dialog = useDialogContext();
	const navigate = useNavigate();
	const ref = useRef<HTMLButtonElement>(null);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const link = ref.current;
		const root = link?.closest('ul');

		if (!link || !root) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry) {
					setVisible(entry.intersectionRatio >= 1);
				}
			},
			{
				root,
				threshold: 1,
			},
		);

		observer.observe(link);

		return () => observer.disconnect();
	}, []);

	let icon: ReactNode;
	let path: string;
	let title: string;
	let description: string;

	switch (result.type) {
		case 'BOOK':
			icon = <BookOpenIcon />;
			path = `/books/${result.data.id}`;
			title = result.data.title;
			description = result.data.author;
			break;

		case 'MEMBER':
			icon = <UsersIcon />;
			path = `/members/${result.data.id}`;
			title = result.data.name;
			description = result.data.externalId;
			break;

		case 'RESERVATION':
			icon = <Calendar1Icon />;
			path = `/reservations?ticket=${encodeURIComponent(result.data.ticket)}`;
			title = result.data.ticket;
			description = result.data.status;
			break;

		case 'TRANSACTION':
			icon = <RotateCcwClockIcon />;
			path = `/transactions?ticket=${encodeURIComponent(result.data.ticket)}`;
			title = result.data.ticket;
			description = `${result.data.type} · ${result.data.status}`;
			break;
	}

	return (
		<button
			ref={ref}
			type="button"
			onClick={() => {
				dialog.setOpen(false);
				navigate(path);
			}}
			className={cx(
				'flex w-full items-center gap-2 text-left transition-opacity duration-50',
				!visible && 'opacity-60',
			)}
		>
			<div
				className={cx(
					'rounded-sm p-2',
					result.type === 'BOOK' && 'bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400',
					result.type === 'MEMBER' &&
						'bg-emerald-50 text-emerald-500 dark:bg-emerald-950 dark:text-emerald-400',
					result.type === 'RESERVATION' &&
						'bg-rose-50 text-rose-500 dark:bg-rose-950 dark:text-rose-400',
					result.type === 'TRANSACTION' &&
						'bg-indigo-50 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400',
				)}
			>
				<ark.svg className="size-5" asChild>
					{icon}
				</ark.svg>
			</div>
			<div className="grow">
				<span className="block truncate font-medium text-gray-700 text-sm dark:text-neutral-200">
					{title}
				</span>
				<span className="block truncate text-gray-500 text-xs dark:text-neutral-400">
					{description}
				</span>
			</div>
		</button>
	);
}
