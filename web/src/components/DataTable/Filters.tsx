import {Portal, Presence} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {useDebouncedCallback} from '@tanstack/react-pacer';
import {omit} from 'es-toolkit';
import {Settings2Icon} from 'lucide-react';
import {useState} from 'react';
import {AsyncComboboxField} from '../forms/AsyncComboboxField';
import {ComboboxField} from '../forms/ComboboxField';
import {DateRangeField} from '../forms/DateRangeField';
import {NumberRangeField, type NumberRangeFieldProps} from '../forms/NumberRangeField';
import {SelectField} from '../forms/SelectField';
import {TextField, type TextFieldProps} from '../forms/TextField';
import {ToggleField} from '../forms/ToggleField';
import {Field} from '../ui/Field';
import {IconButton} from '../ui/IconButton';
import {Tooltip} from '../ui/Tooltip';
import {useDataTableContext, useFiltersContext} from './DataTableContext';

export function Filters() {
	const filters = useFiltersContext();
	const dataTable = useDataTableContext();

	return (
		<Presence present={filters.open} asChild>
			<div className="shrink-0 ui-closed:animate-collapse-x-out ui-open:animate-collapse-x-in overflow-hidden rounded-lg border border-neutral-200 [--width:24rem] dark:border-neutral-800">
				<div className="w-(--width) overflow-hidden p-4">
					<div className="space-y-2">
						{dataTable.columns.map((col) => {
							if (col.filter?.type === 'COMBOBOX') {
								if (col.filter.multiple) {
									return (
										<Field.Root
											key={col.id}
											className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
										>
											<Field.Label>{col.heading}</Field.Label>
											<ComboboxField {...omit(col.filter, ['type'])} portalled />
										</Field.Root>
									);
								} else {
									return (
										<Field.Root
											key={col.id}
											className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
										>
											<Field.Label>{col.heading}</Field.Label>
											<ComboboxField {...omit(col.filter, ['type'])} portalled />
										</Field.Root>
									);
								}
							}

							if (col.filter?.type === 'ASYNC_COMBOBOX') {
								if (col.filter.multiple) {
									return (
										<Field.Root
											key={col.id}
											className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
										>
											<Field.Label>{col.heading}</Field.Label>
											<AsyncComboboxField {...omit(col.filter, ['type'])} portalled />
										</Field.Root>
									);
								} else {
									return (
										<Field.Root
											key={col.id}
											className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
										>
											<Field.Label>{col.heading}</Field.Label>
											<AsyncComboboxField {...omit(col.filter, ['type'])} portalled />
										</Field.Root>
									);
								}
							}

							if (col.filter?.type === 'SELECT') {
								if (col.filter.multiple) {
									return (
										<Field.Root
											key={col.id}
											className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
										>
											<Field.Label>{col.heading}</Field.Label>
											<SelectField {...omit(col.filter, ['type'])} portalled />
										</Field.Root>
									);
								} else {
									return (
										<Field.Root
											key={col.id}
											className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
										>
											<Field.Label>{col.heading}</Field.Label>
											<SelectField {...omit(col.filter, ['type'])} portalled />
										</Field.Root>
									);
								}
							}

							if (col.filter?.type === 'TEXT') {
								return (
									<Field.Root
										key={col.id}
										className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
									>
										<Field.Label>{col.heading}</Field.Label>
										<DebouncedTextField {...omit(col.filter, ['type'])} />
									</Field.Root>
								);
							}

							if (col.filter?.type === 'DATE_RANGE') {
								return (
									<Field.Root
										key={col.id}
										className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
									>
										<Field.Label>{col.heading}</Field.Label>
										<DateRangeField {...omit(col.filter, ['type'])} portalled />
									</Field.Root>
								);
							}

							if (col.filter?.type === 'NUMBER_RANGE') {
								return (
									<Field.Root
										key={col.id}
										className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
									>
										<Field.Label>{col.heading}</Field.Label>
										<DebouncedNumberRangeField
											{...omit(col.filter, ['type'])}
											min={0}
											max={999999}
										/>
									</Field.Root>
								);
							}

							if (col.filter?.type === 'TOGGLE') {
								return (
									<Field.Root
										key={col.id}
										className="w-full rounded-md bg-neutral-50 p-2 dark:bg-neutral-900/40"
									>
										<Field.Label>{col.heading}</Field.Label>
										<ToggleField {...omit(col.filter, ['type'])} />
									</Field.Root>
								);
							}

							return null;
						})}
					</div>
				</div>
			</div>
		</Presence>
	);
}

function DebouncedNumberRangeField({
	value,
	defaultValue,
	onChange,
	...props
}: NumberRangeFieldProps) {
	const [value__external, setValue__external] = useControllableState({
		prop: value,
		defaultProp: defaultValue ?? null,
		onChange,
	});

	const [value__internal, setValue__internal] = useState(value__external);
	const setValue__debounced = useDebouncedCallback(setValue__external, {wait: 300});

	return (
		<NumberRangeField
			value={value__internal}
			onChange={(newValue) => {
				setValue__internal(newValue);
				setValue__debounced(newValue);
			}}
			{...props}
		/>
	);
}

function DebouncedTextField({value, defaultValue, onChange, ...props}: TextFieldProps) {
	const [value__external, setValue__external] = useControllableState({
		prop: value,
		defaultProp: defaultValue ?? '',
		onChange,
	});

	const [value__internal, setValue__internal] = useState(value__external);
	const setValue__debounced = useDebouncedCallback(setValue__external, {wait: 300});

	return (
		<TextField
			value={value__internal}
			onChange={(newValue) => {
				setValue__internal(newValue);
				setValue__debounced(newValue);
			}}
			{...props}
		/>
	);
}

export function FiltersTrigger() {
	const dataTable = useDataTableContext();
	const filters = useFiltersContext();

	if (!dataTable.filtersEnabled) return null;

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<IconButton
					variant="outline"
					accent="gray"
					onClick={() => filters.setOpen((v) => !v)}
					data-state={filters.open ? 'open' : 'closed'}
				>
					<Settings2Icon />
				</IconButton>
			</Tooltip.Trigger>
			<Portal>
				<Tooltip.Positioner>
					<Tooltip.Content>
						<Tooltip.Arrow>
							<Tooltip.ArrowTip />
						</Tooltip.Arrow>
						Filter
					</Tooltip.Content>
				</Tooltip.Positioner>
			</Portal>
		</Tooltip.Root>
	);
}
