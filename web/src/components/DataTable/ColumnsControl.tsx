import {Portal, Presence} from '@ark-ui/react';
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Columns3Icon, GripIcon} from 'lucide-react';
import {CheckField} from '../forms/CheckField';
import {IconButton} from '../ui/IconButton';
import {Tooltip} from '../ui/Tooltip';
import {useColumnsControlContext, useDataTableContext} from './DataTableContext';

export function ColumnsControl() {
	const columnsControl = useColumnsControlContext();

	return (
		<Presence present={columnsControl.open} asChild>
			<div className="shrink-0 ui-closed:animate-collapse-x-out ui-open:animate-collapse-x-in overflow-hidden rounded-xl border [--width:20rem]">
				<div className="w-(--width) overflow-hidden p-4">
					<Items />
				</div>
			</div>
		</Presence>
	);
}

function Items() {
	const dataTable = useDataTableContext();
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const columns = (() => {
		const cols = dataTable.columns.slice();

		cols.sort((i, j) => {
			return dataTable.columnsOrder.indexOf(i.id) - dataTable.columnsOrder.indexOf(j.id);
		});

		return cols;
	})();

	return (
		<DndContext
			sensors={sensors}
			modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			collisionDetection={closestCenter}
			onDragEnd={async ({active, over}) => {
				if (!over || active.id === over.id) return;

				dataTable.setColumnsOrder(
					arrayMove(
						dataTable.columnsOrder,
						dataTable.columnsOrder.indexOf(active.id.toString()),
						dataTable.columnsOrder.indexOf(over.id.toString()),
					),
				);
			}}
		>
			<SortableContext items={columns} strategy={verticalListSortingStrategy}>
				{columns.map((col) => {
					const content = (
						<CheckField
							value={col.hideable ? !dataTable.hiddenColumns.includes(col.id) : true}
							onChange={(checked) => {
								if (checked) {
									dataTable.setHiddenColumns((prev) => prev.filter((id) => col.id !== id));
								} else {
									dataTable.setHiddenColumns((prev) => [...prev, col.id]);
								}
							}}
							disabled={!col.hideable}
						>
							<div className="grow truncate text-base text-neutral-300">{col.heading}</div>
						</CheckField>
					);

					if (!col.orderable) {
						return (
							<div key={col.id} className="not-last:mb-1.5 flex items-center gap-1.5">
								<button type="button" className="text-neutral-400" disabled>
									<GripIcon className="size-5" />
								</button>
								{content}
							</div>
						);
					}

					return (
						<SortableItem key={col.id} id={col.id}>
							{content}
						</SortableItem>
					);
				})}
			</SortableContext>
		</DndContext>
	);
}

interface SortableItemProps {
	id: string;
	children: React.ReactNode;
}

function SortableItem(props: SortableItemProps) {
	const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
		id: props.id,
	});

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
			className="not-last:mb-1.5 flex items-center gap-1.5"
		>
			<button
				type="button"
				{...listeners}
				{...attributes}
				className="cursor-grab ui-dragging:cursor-grabbing text-neutral-400"
				data-dragging={isDragging || undefined}
			>
				<GripIcon className="size-5" />
			</button>
			{props.children}
		</div>
	);
}

export function ColumnsControlTrigger() {
	const dataTable = useDataTableContext();
	const columnsControl = useColumnsControlContext();

	if (!dataTable.columnsControlEnabled) return null;

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<IconButton
					onClick={() => columnsControl.setOpen((v) => !v)}
					className="ui-open:outline-2 ui-open:outline-blue-600 ui-open:outline-solid ui-open:-outline-offset-1"
					data-state={columnsControl.open ? 'open' : 'closed'}
				>
					<Columns3Icon />
				</IconButton>
			</Tooltip.Trigger>
			<Portal>
				<Tooltip.Positioner>
					<Tooltip.Content>
						<Tooltip.Arrow>
							<Tooltip.ArrowTip />
						</Tooltip.Arrow>
						Columns
					</Tooltip.Content>
				</Tooltip.Positioner>
			</Portal>
		</Tooltip.Root>
	);
}
