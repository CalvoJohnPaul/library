import {ArrowLeftIcon} from 'lucide-react';
import {Link, useParams} from 'react-router';
import {Button} from '@/components/ui/Button';
import {Tabs} from '@/components/ui/Tabs';
import {useBookQuery} from '@/hooks/useBookQuery';
import {AddCopy} from './AddCopy';
import {BookProvider} from './BookContext';
import {Copies} from './Copies';
import {Settings} from './Settings';
import {Transactions} from './Transactions';

export function Book() {
	const {id} = useParams<{id: string}>();
	const query = useBookQuery(id ? parseInt(id, 10) : null);

	if (!id) return null;
	if (query.isLoading) return null;
	if (!query.data) {
		return (
			<div className="mx-auto max-w-md py-24 text-center">
				<title>Book not found | read.</title>
				<h1 className="mt-5 font-bold text-xl">Book not found</h1>
				<p className="mt-1 text-gray-600 text-sm">
					The book you are looking for no longer exists or has been removed.
				</p>
				<Button asChild variant="outline" accent="gray" className="mt-6">
					<Link to="/books">
						<ArrowLeftIcon />
						Go to books
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<>
			<title>{`${query.data.title} | read.`}</title>
			<BookProvider value={query.data}>
				<Tabs.Root defaultValue="copies" lazyMount unmountOnExit>
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

						<Tabs.Context>{(api) => <>{api.value === 'copies' && <AddCopy />}</>}</Tabs.Context>
					</div>

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
