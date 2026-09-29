import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {NumberInput} from '../ui/NumberInput';

export interface NumberFieldProps {
	value?: number | null;
	defaultValue?: number | null;
	onChange?: (value: number | null) => void;
	min?: number;
	max?: number;
	step?: number;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
}

export function NumberField(props: NumberFieldProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? null,
		onChange: props.onChange,
	});

	return (
		<NumberInput.Root
			value={value?.toString() ?? ''}
			onValueChange={(details) => {
				setValue(Number.isNaN(details.valueAsNumber) ? null : details.valueAsNumber);
			}}
			min={props.min}
			max={props.max}
			step={props.step}
			disabled={props.disabled}
			required={props.required}
			readOnly={props.readOnly}
			invalid={props.invalid}
			allowMouseWheel
			clampValueOnBlur
			inputMode="decimal"
			formatOptions={{
				maximumFractionDigits: 2,
				minimumFractionDigits: 0,
				useGrouping: false,
			}}
			className={props.className}
		>
			<NumberInput.Control>
				<NumberInput.Input placeholder={props.placeholder || '0'} />
				<NumberInput.IncrementTrigger />
				<NumberInput.DecrementTrigger />
			</NumberInput.Control>
			<NumberInput.Scrubber />
		</NumberInput.Root>
	);
}
