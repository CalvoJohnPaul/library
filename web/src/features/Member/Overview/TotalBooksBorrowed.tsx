import {BookOpenIcon} from 'lucide-react';
import {Stat} from '@/components/ui/Stat';
import {DeltaBadge} from './DeltaBadge';
import {useOverviewContext} from './OverviewContext';

export function TotalBooksBorrowed() {
	const {monthOverMonth} = useOverviewContext();

	return (
		<Stat.Root size="md" accent="info" className="sm:col-span-4 xl:col-span-3">
			<Stat.Label>Total books borrowed</Stat.Label>
			<Stat.Icon>
				<BookOpenIcon />
			</Stat.Icon>
			<Stat.ValueText>{monthOverMonth.borrows.current.toLocaleString()}</Stat.ValueText>
			<DeltaBadge delta={monthOverMonth.borrows} />
			<Stat.HelpText>borrowed this month</Stat.HelpText>
		</Stat.Root>
	);
}
