import {CircleCheckIcon} from 'lucide-react';
import {Stat} from '@/components/ui/Stat';
import {useDashboardContext} from './DashboardContext';

export function ReadyToClaim() {
	const {totalReadyToClaimReservations} = useDashboardContext();

	return (
		<Stat.Root size="sm" accent="success">
			<Stat.Label>Ready to claim</Stat.Label>
			<Stat.Icon>
				<CircleCheckIcon />
			</Stat.Icon>
			<Stat.ValueText>{totalReadyToClaimReservations.toLocaleString()}</Stat.ValueText>
		</Stat.Root>
	);
}
