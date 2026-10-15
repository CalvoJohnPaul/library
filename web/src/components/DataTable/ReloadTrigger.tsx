import {Portal} from '@ark-ui/react';
import {RefreshCcwIcon} from 'lucide-react';
import {useState} from 'react';
import {useTimeout} from '@/hooks/useTimeout';
import {IconButton} from '../ui/IconButton';
import {Tooltip} from '../ui/Tooltip';
import {useDataTableContext} from './DataTableContext';

export function ReloadTrigger() {
	const {onReload, loading} = useDataTableContext();
	const [pending, setPending] = useState(false);

	useTimeout(() => setPending(false), pending && !loading ? 1000 : null);

	if (onReload == null) return null;

	return (
		<Tooltip.Root disabled={loading}>
			<Tooltip.Trigger asChild>
				<IconButton
					variant="outline"
					accent="gray"
					onClick={() => {
						setPending(true);
						onReload?.();
					}}
					disabled={pending}
				>
					<RefreshCcwIcon className={pending ? 'animate-spin' : 'animate-none'} />
				</IconButton>
			</Tooltip.Trigger>
			<Portal>
				<Tooltip.Positioner>
					<Tooltip.Content>
						<Tooltip.Arrow>
							<Tooltip.ArrowTip />
						</Tooltip.Arrow>
						Reload
					</Tooltip.Content>
				</Tooltip.Positioner>
			</Portal>
		</Tooltip.Root>
	);
}
