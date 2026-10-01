import {ArrowLeftIcon} from 'lucide-react';
import {Link, useParams} from 'react-router';
import {Tabs} from '@/components/ui/Tabs';
import {useStudentQuery} from '@/hooks/useStudentQuery';
import {StudentProvider} from './StudentContext';
import {Transactions} from './Transactions';

export function Student() {
	const {id} = useParams<{id: string}>();
	const query = useStudentQuery(id ? parseInt(id, 10) : null);

	if (!id) return null;
	if (query.isLoading) return null;
	if (!query.data) return null /* TODO: Show 404 page */;

	return (
		<>
			<title>{`${query.data.name} | read.`}</title>
			<StudentProvider value={query.data}>
				<div>
					<Link to="/students" className="flex items-center gap-1 text-blue-500 text-xs">
						<ArrowLeftIcon className="size-3.5" />
						Go to students
					</Link>
				</div>

				<div className="mb-6 flex items-center gap-3">
					<div className="grow">
						<h1 className="font-bold text-xl">{query.data.name}</h1>
						<p className="text-gray-600 text-sm">Manage the details of your student below.</p>
					</div>
				</div>

				<Tabs.Root defaultValue="transactions" lazyMount unmountOnExit>
					<Tabs.List className="mb-8 w-100">
						<Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
						<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>
					<Tabs.Content value="transactions">
						<Transactions />
					</Tabs.Content>
					<Tabs.Content value="settings"></Tabs.Content>
				</Tabs.Root>
			</StudentProvider>
		</>
	);
}
