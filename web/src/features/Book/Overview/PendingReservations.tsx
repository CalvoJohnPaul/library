import {CalendarClockIcon} from 'lucide-react';
import {Stat} from '@/components/ui/Stat';
import {useOverviewContext} from './OverviewContext';

export function PendingReservations() {
	const {totalPendingReservations} = useOverviewContext();
	return (
		<Stat.Root size="sm" accent="warning">
			<Stat.Label>Pending reservations</Stat.Label>
			<Stat.Icon>
				<CalendarClockIcon />
			</Stat.Icon>
			<Stat.ValueText>{totalPendingReservations.toLocaleString()}</Stat.ValueText>
		</Stat.Root>
	);
}
