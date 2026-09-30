import {Portal} from '@ark-ui/react';
import {DownloadIcon} from 'lucide-react';
import {IconButton} from '../ui/IconButton';
import {Tooltip} from '../ui/Tooltip';
import {useDataTableContext} from './DataTableContext';

export function ExportTrigger() {
	const {onExport, exporting} = useDataTableContext();

	if (onExport == null) return null;

	return (
		<Tooltip.Root disabled={exporting}>
			<Tooltip.Trigger asChild>
				<IconButton variant="outline" accent="gray" disabled={exporting}>
					<DownloadIcon />
				</IconButton>
			</Tooltip.Trigger>
			<Portal>
				<Tooltip.Positioner>
					<Tooltip.Content>
						<Tooltip.Arrow>
							<Tooltip.ArrowTip />
						</Tooltip.Arrow>
						Export
					</Tooltip.Content>
				</Tooltip.Positioner>
			</Portal>
		</Tooltip.Root>
	);
}
