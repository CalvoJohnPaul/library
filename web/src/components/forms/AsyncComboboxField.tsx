import {Portal} from '@ark-ui/react';
import {useListCollection} from '@ark-ui/react/collection';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {useDebouncedCallback} from '@tanstack/react-pacer';
import {SearchIcon, XIcon} from 'lucide-react';
import {useRef, useState} from 'react';
import {useTimeout} from '@/hooks/useTimeout';
import type {Option} from '@/types/index';
import {Combobox} from '../ui/Combobox';
import {Popover} from '../ui/Popover';
import {Tags} from '../ui/Tags';

export interface AsyncComboboxField__singleProps {
	options: (inputValue: string, value: string) => Promise<Option[]>;
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

export interface AsyncComboboxField__multiProps {
	options: (inputValue: string, value: string[]) => Promise<Option[]>;
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

export type AsyncComboboxFieldProps =
	| AsyncComboboxField__singleProps
	| AsyncComboboxField__multiProps;

export function AsyncComboboxField(props: AsyncComboboxFieldProps) {
	if (props.multiple) return <AsyncComboboxField__multi {...props} />;
	return <AsyncComboboxField__single {...props} />;
}

function AsyncComboboxField__single(props: AsyncComboboxField__singleProps) {
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

	const {collection, set} = useListCollection<Option>({
		initialItems: [],
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
		isItemDisabled: (item) => item.disabled ?? false,
	});

	const loadSeqRef = useRef(0);

	const loadOptions = useDebouncedCallback(
		async (inputValue: string, value: string) => {
			const seq = ++loadSeqRef.current;
			const l = await props.options(inputValue, value);
			if (seq !== loadSeqRef.current) return;
			set(l);
		},
		{wait: 250},
	);

	const [inited, setInited] = useState(false);

	useTimeout(
		() => {
			setInited(true);
			loadOptions('', value);
		},
		!inited ? 1 : null,
	);

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
					<div className="mx-auto grid size-10 place-items-center rounded-md border border-gray-200">
						<SearchIcon className="size-5 text-gray-600" />
					</div>
					<h2 className="mt-2 text-center font-semibold text-gray-700 text-sm">No results found</h2>
					<p className="text-center text-gray-500 text-xs">
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
			onInputValueChange={async (details) => {
				setInputValue(details.inputValue);
				loadOptions(details.inputValue, value);
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
				<Combobox.ClearTrigger />
			</Combobox.Control>
			{props.portalled ? <Portal>{content}</Portal> : content}
		</Combobox.Root>
	);
}

function AsyncComboboxField__multi(props: AsyncComboboxField__multiProps) {
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

	const {collection, set} = useListCollection<Option>({
		initialItems: [],
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
		isItemDisabled: (item) => item.disabled ?? false,
	});

	/* the collection only holds the latest search results, so selected values can fall out of
	 * it (e.g. after typing a new search, or before the initial options load). Remember the
	 * label of every option ever loaded or selected so tags never render empty text. */
	const [labels, setLabels] = useState<Record<string, string>>({});

	const rememberLabels = (options: Option[]) => {
		setLabels((prev) => {
			const hasNew = options.some((option) => prev[option.value] !== option.label);
			if (!hasNew) return prev;
			const next = {...prev};
			for (const option of options) next[option.value] = option.label;
			return next;
		});
	};

	const labelOf = (value: string) => labels[value] ?? collection.stringify(value) ?? value;

	const loadSeqRef = useRef(0);

	const loadOptions = useDebouncedCallback(
		async (inputValue: string, value: string[]) => {
			const seq = ++loadSeqRef.current;
			const l = await props.options(inputValue, value);
			if (seq !== loadSeqRef.current) return;
			rememberLabels(l);
			set(l);
		},
		{wait: 250},
	);

	const [inited, setInited] = useState(false);

	useTimeout(
		() => {
			setInited(true);
			loadOptions('', value);
		},
		!inited ? 1 : null,
	);

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
					<div className="mx-auto grid size-10 place-items-center rounded-md border border-gray-200">
						<SearchIcon className="size-5 text-gray-600" />
					</div>
					<h2 className="mt-2 text-center font-semibold text-gray-700 text-sm">No results found</h2>
					<p className="text-center text-gray-500 text-xs">
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
				rememberLabels(collection.items.filter((item) => details.value.includes(item.value)));
				setValue(details.value);
			}}
			inputValue={inputValue}
			onInputValueChange={(details) => {
				setInputValue(details.inputValue);
				loadOptions(details.inputValue, value);
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
				<Combobox.ClearTrigger />
			</Combobox.Control>
			<Combobox.Context>
				{(api) => {
					const items = api.value;
					const itemsTotal = api.value.length;

					if (itemsTotal <= 0) return null;

					const maxVisibleItems = 5;
					const shouldClamp = itemsTotal > maxVisibleItems + 1;
					const visibleItems = shouldClamp ? items.slice(0, maxVisibleItems) : items;
					const hiddenItems = shouldClamp ? items.slice(maxVisibleItems) : [];
					const hiddenItemsTotal = hiddenItems.length;

					return (
						<Tags.Root className="mt-2">
							{visibleItems.map((value) => (
								<Tags.Item key={value}>
									<Tags.ItemText>{labelOf(value)}</Tags.ItemText>
									<Tags.ItemCloseTrigger
										onClick={() => {
											api.clearValue(value);
										}}
									/>
								</Tags.Item>
							))}

							{hiddenItemsTotal > 0 && (
								<Popover.Root>
									<Popover.Trigger asChild>
										<Tags.Item key="hidden">
											<Tags.ItemText>+{hiddenItemsTotal} more</Tags.ItemText>
										</Tags.Item>
									</Popover.Trigger>
									<Popover.Positioner>
										<Popover.Content>
											<Popover.Arrow>
												<Popover.ArrowTip />
											</Popover.Arrow>

											<ul>
												{hiddenItems.map((value) => (
													<li key={value} className="flex items-center gap-2">
														<span className="inline-block size-1.25 shrink-0 rounded-full bg-white/25"></span>
														<span className="inline-block grow">{labelOf(value)}</span>
														<button
															className="inline-block size-4 shrink-0"
															type="button"
															onClick={() => api.clearValue(value)}
														>
															<XIcon className="size-4 text-white/50" />
														</button>
													</li>
												))}
											</ul>
										</Popover.Content>
									</Popover.Positioner>
								</Popover.Root>
							)}
						</Tags.Root>
					);
				}}
			</Combobox.Context>
			{props.portalled ? <Portal>{content}</Portal> : content}
		</Combobox.Root>
	);
}
