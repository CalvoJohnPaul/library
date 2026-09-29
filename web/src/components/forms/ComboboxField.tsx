import {Portal, useFilter} from '@ark-ui/react';
import {useListCollection} from '@ark-ui/react/collection';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {SearchIcon} from 'lucide-react';
import type {Option} from '@/types/index';
import {Combobox} from '../ui/Combobox';
import {Tags} from '../ui/Tags';

export interface ComboboxField__singleProps {
	options: Option[];
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	inpuValue?: string;
	defaultInpuValue?: string;
	onInpuValueChange?: (value: string) => void;
	multiple?: false;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	portalled?: boolean;
}

export interface ComboboxField__multiProps {
	options: Option[];
	value?: string[];
	defaultValue?: string[];
	onChange?: (value: string[]) => void;
	inpuValue?: string;
	defaultInpuValue?: string;
	onInpuValueChange?: (value: string) => void;
	multiple: true;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	portalled?: boolean;
}

export type ComboboxFieldProps = ComboboxField__singleProps | ComboboxField__multiProps;

export function ComboboxField(props: ComboboxFieldProps) {
	if (props.multiple) return <ComboboxField__multi {...props} />;
	return <ComboboxField__single {...props} />;
}

function ComboboxField__single(props: ComboboxField__singleProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? '',
		onChange: props.onChange,
	});

	const [inputValue, setInputValue] = useControllableState({
		prop: props.inpuValue,
		defaultProp: props.defaultInpuValue ?? '',
		onChange: props.onInpuValueChange,
	});

	const {contains} = useFilter({sensitivity: 'base'});
	const {collection, filter} = useListCollection({
		initialItems: props.options,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
		isItemDisabled: (item) => item.disabled ?? false,
		filter: contains,
	});

	const content = (
		<Combobox.Positioner>
			<Combobox.Content>
				{collection.items.map((item) => (
					<Combobox.Item key={item.value} item={item}>
						<Combobox.ItemText>{item.label}</Combobox.ItemText>
						<Combobox.ItemIndicator />
					</Combobox.Item>
				))}
				<Combobox.Empty className="p-8">
					<div className="mx-auto grid size-10 place-items-center rounded-lg border border-neutral-700/75">
						<SearchIcon className="size-5 text-neutral-300" />
					</div>
					<h2 className="mt-2 text-center font-semibold text-neutral-300 text-sm">
						No results found
					</h2>
					<p className="text-center text-neutral-400 text-xs">
						There are no items that match your current search or filters.
					</p>
				</Combobox.Empty>
			</Combobox.Content>
		</Combobox.Positioner>
	);

	return (
		<Combobox.Root
			value={value ? [value] : []}
			onValueChange={(details) => {
				setValue(details.value.at(0) ?? '');
			}}
			inputValue={inputValue}
			onInputValueChange={(details) => {
				setInputValue(details.inputValue);
				if (details.reason === 'input-change') {
					filter(details.inputValue);
				}
			}}
			collection={collection}
			multiple={false}
			disabled={props.disabled}
			required={props.required}
			readOnly={props.readOnly}
			invalid={props.invalid}
			closeOnSelect
			selectionBehavior="replace"
			placeholder={props.placeholder || 'Search'}
			className={props.className}
		>
			<Combobox.Label />
			<Combobox.Control>
				<Combobox.Input />
				<Combobox.Trigger />
			</Combobox.Control>
			{props.portalled ? <Portal>{content}</Portal> : content}
		</Combobox.Root>
	);
}

function ComboboxField__multi(props: ComboboxField__multiProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? [],
		onChange: props.onChange,
	});

	const [inputValue, setInputValue] = useControllableState({
		prop: props.inpuValue,
		defaultProp: props.defaultInpuValue ?? '',
		onChange: props.onInpuValueChange,
	});

	const {contains} = useFilter({sensitivity: 'base'});

	const {collection, filter} = useListCollection({
		initialItems: props.options,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
		isItemDisabled: (item) => item.disabled ?? false,
		filter: contains,
	});

	const content = (
		<Combobox.Positioner>
			<Combobox.Content>
				{collection.items.map((item) => (
					<Combobox.Item key={item.value} item={item}>
						<Combobox.ItemText>{item.label}</Combobox.ItemText>
						<Combobox.ItemIndicator />
					</Combobox.Item>
				))}
				<Combobox.Empty className="p-8">
					<div className="mx-auto grid size-10 place-items-center rounded-lg border border-neutral-700/75">
						<SearchIcon className="size-5 text-neutral-300" />
					</div>
					<h2 className="mt-2 text-center font-semibold text-neutral-300 text-sm">
						No results found
					</h2>
					<p className="text-center text-neutral-400 text-xs">
						There are no items that match your current search or filters.
					</p>
				</Combobox.Empty>
			</Combobox.Content>
		</Combobox.Positioner>
	);

	return (
		<Combobox.Root
			value={value}
			onValueChange={(details) => {
				setValue(details.value);
			}}
			inputValue={inputValue}
			onInputValueChange={(details) => {
				setInputValue(details.inputValue);
				if (details.reason === 'input-change') {
					filter(details.inputValue);
				}
			}}
			collection={collection}
			multiple
			disabled={props.disabled}
			required={props.required}
			readOnly={props.readOnly}
			invalid={props.invalid}
			selectionBehavior="preserve"
			closeOnSelect={false}
			placeholder={props.placeholder || 'Search'}
			className={props.className}
		>
			<Combobox.Control>
				<Combobox.Input />
				<Combobox.Trigger />
			</Combobox.Control>
			<Combobox.Context>
				{(api) => {
					if (api.value.length <= 0) return null;
					return (
						<Tags.Root className="mt-2">
							{api.value.map((value) => (
								<Tags.Item key={value}>
									<Tags.ItemText>{collection.stringify(value)}</Tags.ItemText>
									<Tags.ItemCloseTrigger
										onClick={() => {
											api.clearValue(value);
										}}
									/>
								</Tags.Item>
							))}
						</Tags.Root>
					);
				}}
			</Combobox.Context>
			{props.portalled ? <Portal>{content}</Portal> : content}
		</Combobox.Root>
	);
}
