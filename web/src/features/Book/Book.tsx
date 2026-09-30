import {PlusIcon} from 'lucide-react';
import {useParams} from 'react-router';
import {Button} from '@/components/ui/Button';
import {Tabs} from '@/components/ui/Tabs';
import {useBookQuery} from '@/hooks/useBookQuery';
import {BookProvider} from './BookContext';
import {Copies} from './Copies';

export function Book() {
	const {id} = useParams<{id: string}>();
	const query = useBookQuery(id ? parseInt(id, 10) : null);

	if (!id) return null;
	if (!query.data) return null;

	return (
		<BookProvider value={query.data}>
			<div>
				<div className="mb-8 flex items-center gap-3">
					<div className="grow">
						<h1 className="font-bold text-xl">{query.data.title}</h1>
						<p className="text-gray-600 text-sm">Manage the details of your book below.</p>
					</div>
					<Button>
						<PlusIcon />
						Add copy
					</Button>
				</div>
			</div>
			<Tabs.Root defaultValue="copies" lazyMount>
				<Tabs.List className="mb-8 w-80">
					<Tabs.Trigger value="copies">Copies</Tabs.Trigger>
					<Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
					<Tabs.Indicator />
				</Tabs.List>
				<Tabs.Content value="copies">
					<Copies />
				</Tabs.Content>
				<Tabs.Content value="transactions"></Tabs.Content>
			</Tabs.Root>
		</BookProvider>
	);
}
