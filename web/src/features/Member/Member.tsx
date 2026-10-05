import {ArrowLeftIcon} from 'lucide-react';
import {Link, useParams} from 'react-router';
import {Button} from '@/components/ui/Button/Button';
import {Tabs} from '@/components/ui/Tabs';
import {useMemberQuery} from '@/hooks/useMemberQuery';
import {MemberProvider} from './MemberContext';
import {Settings} from './Settings';
import {Transactions} from './Transactions';

export function Member() {
	const {id} = useParams<{id: string}>();
	const query = useMemberQuery(id ? parseInt(id, 10) : null);

	if (!id) return null;
	if (query.isLoading) return null;
	if (!query.data) {
		return (
			<div className="mx-auto max-w-md py-24 text-center">
				<title>Member not found | read.</title>
				<h1 className="mt-5 font-bold text-xl">Member not found</h1>
				<p className="mt-1 text-gray-600 text-sm">
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

				<Tabs.Root defaultValue="transactions" lazyMount unmountOnExit>
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
