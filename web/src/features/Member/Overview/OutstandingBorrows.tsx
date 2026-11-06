import {ClockIcon} from 'lucide-react';
import {Stat} from '@/components/ui/Stat';
import {DeltaBadge} from './DeltaBadge';
import {useOverviewContext} from './OverviewContext';

export function OutstandingBorrows() {
	const {totalOutstandingBorrows, monthOverMonth} = useOverviewContext();

	return (
		<Stat.Root size="md" accent="warning" className="sm:col-span-4 xl:col-span-3">
			<Stat.Label>Outstanding borrows</Stat.Label>
			<Stat.Icon>
				<ClockIcon />
			</Stat.Icon>
			<Stat.ValueText>{totalOutstandingBorrows.toLocaleString()}</Stat.ValueText>
			<DeltaBadge delta={monthOverMonth.borrows} />
			<Stat.HelpText>copies currently borrowed</Stat.HelpText>
		</Stat.Root>
	);
}
