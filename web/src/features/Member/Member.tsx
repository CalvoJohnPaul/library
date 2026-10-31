import {ArrowLeftIcon} from 'lucide-react';
import {Link, useNavigate, useParams, useSearchParams} from 'react-router';
import * as z from 'zod';
import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Button} from '@/components/ui/Button/Button';
import {Tabs} from '@/components/ui/Tabs';
import {useMemberQuery} from '@/hooks/useMemberQuery';
import {MemberProvider} from './MemberContext';
import {Reservations} from './Reservations';
import {Settings} from './Settings';
import {Transactions} from './Transactions';

const TabDefinition = z.enum(['transactions', 'reservations', 'settings']).catch('transactions');

export function Member() {
	const {id} = useParams<{id: string}>();
	const query = useMemberQuery(id ? parseInt(id, 10) : null);
	const navigate = useNavigate();
	const [search] = useSearchParams();
	const tab = TabDefinition.parse(search.get('tab'));
	const setTab = (value: string) => {
		const tab = TabDefinition.parse(value);

		if (tab === 'transactions') {
			navigate(`/members/${id}`);
		} else {
			navigate(`/members/${id}?tab=${tab}`);
		}
	};

	if (!id) return null;

	if (query.isLoading) {
		return (
			<div className="flex items-center gap-1.5">
				<SpinnerIcon className="size-4.5 text-blue-500 dark:text-blue-400" />
				<span className="text-neutral-600 dark:text-neutral-300">Loading.</span>
			</div>
		);
	}

	if (!query.data) {
		return (
			<div className="mx-auto max-w-md py-24 text-center">
				<title>Member not found | USAT</title>
				<h1 className="mt-5 font-bold text-xl">Member not found</h1>
				<p className="mt-1 text-neutral-600 text-sm dark:text-neutral-300">
					The member you are looking for no longer exists or has been removed.
				</p>
				<Button asChild variant="outline" accent="gray" className="mt-6">
					<Link to="/members">
						<ArrowLeftIcon />
						Go to members
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<>
			<title>{`${query.data.name} | USAT`}</title>
			<MemberProvider value={query.data}>
				<div>
					<Link
						to="/members"
						className="flex items-center gap-1 text-blue-500 text-xs dark:text-blue-400"
					>
						<ArrowLeftIcon className="size-3.5" />
						Go to members
					</Link>
				</div>

				<div className="mb-6 flex items-center gap-3">
					<div className="grow">
						<h1 className="font-bold text-xl">{query.data.name}</h1>
						<p className="text-neutral-600 text-sm dark:text-neutral-300">
							Manage the details of your member below.
						</p>
					</div>
				</div>

				<Tabs.Root
					value={tab}
					onValueChange={(details) => {
						setTab(details.value);
					}}
					lazyMount
					unmountOnExit
				>
					<Tabs.List className="mb-8 w-100">
						<Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
						<Tabs.Trigger value="reservations">Reservations</Tabs.Trigger>
						<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>
					<Tabs.Content value="transactions">
						<Transactions />
					</Tabs.Content>
					<Tabs.Content value="reservations">
						<Reservations />
					</Tabs.Content>
					<Tabs.Content value="settings">
						<Settings />
					</Tabs.Content>
				</Tabs.Root>
			</MemberProvider>
		</>
	);
}
