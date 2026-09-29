import {Portal} from '@ark-ui/react';
import {RefreshCcwIcon} from 'lucide-react';
import {useBoolean, useTimeout} from 'usehooks-ts';
import {IconButton} from '../ui/IconButton';
import {Tooltip} from '../ui/Tooltip';
import {useDataTableContext} from './DataTableContext';

export function ReloadTrigger() {
	const {onReload, loading} = useDataTableContext();
	const pending = useBoolean();

	useTimeout(pending.setFalse, pending.value && !loading ? 1000 : null);

	if (onReload == null) return null;

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<IconButton
					onClick={() => {
						pending.setTrue();
						onReload?.();
					}}
					disabled={pending.value}
				>
					<RefreshCcwIcon className={pending.value ? 'animate-spin' : 'animate-none'} />
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
