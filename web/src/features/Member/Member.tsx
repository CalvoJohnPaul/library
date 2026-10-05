import {ArrowLeftIcon} from 'lucide-react';
import {parseAsStringLiteral, useQueryState} from 'nuqs';
import {Link, useParams} from 'react-router';
import * as z from 'zod';
import {Tabs} from '@/components/ui/Tabs';
import {useMemberQuery} from '@/hooks/useMemberQuery';
import {MemberProvider} from './MemberContext';
import {Settings} from './Settings';
import {Transactions} from './Transactions';

const TabDefinition = z.enum(['transactions', 'settings']);

export function Member() {
	const {id} = useParams<{id: string}>();
	const query = useMemberQuery(id ? parseInt(id, 10) : null);
	const [tab, setTab] = useQueryState(
		'tab',
		parseAsStringLiteral(TabDefinition.options).withDefault('transactions'),
	);

	if (!id) return null;
	if (query.isLoading) return null;
	if (!query.data) return null /* TODO: Show 404 page */;

	return (
		<>
			<title>{`${query.data.name} | read.`}</title>
			<MemberProvider value={query.data}>
				<div>
					<Link to="/members" className="flex items-center gap-1 text-blue-500 text-xs">
						<ArrowLeftIcon className="size-3.5" />
						Go to members
					</Link>
				</div>

				<div className="mb-6 flex items-center gap-3">
					<div className="grow">
						<h1 className="font-bold text-xl">{query.data.name}</h1>
						<p className="text-gray-600 text-sm">Manage the details of your member below.</p>
					</div>
				</div>

				<Tabs.Root
					defaultValue={tab}
					onValueChange={(details) => {
						setTab(TabDefinition.catch('transactions').parse(details.value));
					}}
					lazyMount
					unmountOnExit
				>
					<Tabs.List className="mb-8 w-100">
						<Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
						<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>
					<Tabs.Content value="transactions">
						<Transactions />
					</Tabs.Content>
					<Tabs.Content value="settings">
						<Settings />
					</Tabs.Content>
				</Tabs.Root>
			</MemberProvider>
		</>
	);
}
