import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {PinInput} from '../ui/PinInput';

export interface OtpFieldProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	className?: string;
}

export function OtpField(props: OtpFieldProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? '',
		onChange: props.onChange,
	});

	const valueAsArray = Array.from({length: 6}, (_, i) => value.charAt(i) ?? '');

	return (
		<PinInput.Root
			value={valueAsArray}
			onValueChange={(details) => {
				setValue(details.valueAsString);
			}}
			otp
			type="alphanumeric"
			placeholder=""
			disabled={props.disabled}
			required={props.required}
			readOnly={props.readOnly}
			invalid={props.invalid}
			className={props.className}
		>
			<PinInput.Control>
				{Array.from({length: 6}, (_, idx) => idx).map((idx) => (
					<PinInput.Input key={idx} index={idx} />
				))}
			</PinInput.Control>
			<PinInput.HiddenInput />
		</PinInput.Root>
	);
}
