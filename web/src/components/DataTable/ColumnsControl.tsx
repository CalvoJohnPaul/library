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
	const dataTable = useDataTableContext();
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const columns = (() => {
		const cols = dataTable.columns.filter((col) => col.id !== 'actions');

		cols.sort((i, j) => {
			return dataTable.columnsOrder.indexOf(i.id) - dataTable.columnsOrder.indexOf(j.id);
		});

		return cols;
	})();

	return (
		<Presence present={columnsControl.open} asChild>
			<div className="shrink-0 ui-closed:animate-collapse-x-out ui-open:animate-collapse-x-in overflow-hidden rounded-lg border border-neutral-200 [--width:18rem] dark:border-neutral-800">
				<div className="w-(--width) overflow-hidden p-4">
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
										<div className="grow truncate text-base text-neutral-700 dark:text-neutral-200">
											{col.heading}
										</div>
									</CheckField>
								);

								if (!col.orderable) {
									return (
										<div key={col.id} className="not-last:mb-1.5 flex items-center gap-1.5">
											<button
												type="button"
												className="text-neutral-500 dark:text-neutral-400"
												disabled
											>
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
				</div>
			</div>
		</Presence>
	);
}

function SortableItem(props: {id: string; children: React.ReactNode}) {
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
				className="cursor-grab ui-dragging:cursor-grabbing text-neutral-500 dark:text-neutral-400"
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
					variant="outline"
					accent="gray"
					onClick={() => columnsControl.setOpen((v) => !v)}
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
