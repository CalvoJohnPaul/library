import {Portal, useListCollection} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {XIcon} from 'lucide-react';
import type {Option} from '@/types/index';
import {Popover} from '../ui/Popover';
import {Select} from '../ui/Select';
import {Tags} from '../ui/Tags';

export interface SelectField__singleProps {
	options: Option[];
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	multiple?: false;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	portalled?: boolean;
}

export interface SelectField__multiProps {
	options: Option[];
	value?: string[];
	defaultValue?: string[];
	onChange?: (value: string[]) => void;
	multiple: true;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	portalled?: boolean;
}

export type SelectFieldProps = SelectField__singleProps | SelectField__multiProps;

export function SelectField(props: SelectFieldProps) {
	if (props.multiple) return <SelectField__multi {...props} />;
	return <SelectField__single {...props} />;
}

function SelectField__single(props: SelectField__singleProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? '',
		onChange: props.onChange,
	});

	const {collection} = useListCollection({
		initialItems: props.options,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
		isItemDisabled: (item) => item.disabled ?? false,
	});

	const content = (
		<Select.Positioner>
			<Select.Content>
				{collection.items.map((item) => (
					<Select.Item key={item.label} item={item}>
						<Select.ItemText>{item.label}</Select.ItemText>
						<Select.ItemIndicator />
					</Select.Item>
				))}
			</Select.Content>
		</Select.Positioner>
	);

	return (
		<Select.Root
			value={value ? [value] : []}
			onValueChange={(details) => {
				setValue(details.value.at(0) ?? '');
			}}
			collection={collection}
			multiple={false}
			closeOnSelect
			disabled={props.disabled}
			required={props.required}
			readOnly={props.readOnly}
			invalid={props.invalid}
			className={props.className}
		>
			<Select.Control>
				<Select.Trigger>
					<Select.ValueText placeholder={props.placeholder || 'Select'} />
					<Select.Indicator />
				</Select.Trigger>
			</Select.Control>
			<Select.HiddenSelect />
			{props.portalled ? <Portal>{content}</Portal> : content}
		</Select.Root>
	);
}

function SelectField__multi(props: SelectField__multiProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? [],
		onChange: props.onChange,
	});

	const {collection} = useListCollection({
		initialItems: props.options,
		itemToString: (item) => item.label,
		itemToValue: (item) => item.value,
		isItemDisabled: (item) => item.disabled ?? false,
	});

	const content = (
		<Select.Positioner>
			<Select.Content>
				{collection.items.map((item) => (
					<Select.Item key={item.label} item={item}>
						<Select.ItemText>{item.label}</Select.ItemText>
						<Select.ItemIndicator />
					</Select.Item>
				))}
			</Select.Content>
		</Select.Positioner>
	);

	return (
		<Select.Root
			value={value}
			onValueChange={(details) => {
				setValue(details.value);
			}}
			collection={collection}
			multiple
			closeOnSelect={false}
			disabled={props.disabled}
			required={props.required}
			readOnly={props.readOnly}
			invalid={props.invalid}
			className={props.className}
		>
			<Select.Label />
			<Select.Control>
				<Select.Trigger>
					<Select.Context>
						{(api) => (
							<Select.ValueText placeholder={props.placeholder || 'Select'}>
								{api.value.length <= 0
									? null
									: api.value.length === 1
										? `${api.value.length} item selected`
										: `${api.value.length} items selected`}
							</Select.ValueText>
						)}
					</Select.Context>
					<Select.Indicator />
				</Select.Trigger>
			</Select.Control>
			<Select.Context>
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
									<Tags.ItemText>{collection.stringify(value)}</Tags.ItemText>
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
														<span className="inline-block grow">{collection.stringify(value)}</span>
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
			</Select.Context>

			<Select.HiddenSelect />
			{props.portalled ? <Portal>{content}</Portal> : content}
		</Select.Root>
	);
}
