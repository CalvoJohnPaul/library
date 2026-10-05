import {ArrowLeftIcon} from 'lucide-react';
import {parseAsStringLiteral, useQueryState} from 'nuqs';
import {Link, useParams} from 'react-router';
import * as z from 'zod';
import {Tabs} from '@/components/ui/Tabs';
import {useBookQuery} from '@/hooks/useBookQuery';
import {AddCopy} from './AddCopy';
import {BookProvider} from './BookContext';
import {Copies} from './Copies';
import {Settings} from './Settings';
import {Transactions} from './Transactions';

const TabDefinition = z.enum(['copies', 'transactions', 'settings']);

export function Book() {
	const {id} = useParams<{id: string}>();
	const query = useBookQuery(id ? parseInt(id, 10) : null);
	const [tab, setTab] = useQueryState(
		'tab',
		parseAsStringLiteral(TabDefinition.options).withDefault('copies'),
	);

	if (!id) return null;
	if (query.isLoading) return null;
	if (!query.data) return null /* TODO: Show 404 page */;

	return (
		<>
			<title>{`${query.data.title} | read.`}</title>
			<BookProvider value={query.data}>
				<div>
					<Link to="/books" className="flex items-center gap-1 text-blue-500 text-xs">
						<ArrowLeftIcon className="size-3.5" />
						Go to books
					</Link>
				</div>

				<div className="mb-6 flex items-center gap-3">
					<div className="grow">
						<h1 className="font-bold text-xl">{query.data.title}</h1>
						<p className="text-gray-600 text-sm">Manage the details of your book below.</p>
					</div>

					{tab === 'copies' && <AddCopy />}
				</div>

				<Tabs.Root
					value={tab}
					onValueChange={(details) => setTab(TabDefinition.catch('copies').parse(details.value))}
					lazyMount
					unmountOnExit
				>
					<Tabs.List className="mb-8 w-100">
						<Tabs.Trigger value="copies">Copies</Tabs.Trigger>
						<Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
						<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>
					<Tabs.Content value="copies">
						<Copies />
					</Tabs.Content>
					<Tabs.Content value="transactions">
						<Transactions />
					</Tabs.Content>
					<Tabs.Content value="settings">
						<Settings />
					</Tabs.Content>
				</Tabs.Root>
			</BookProvider>
		</>
	);
}
