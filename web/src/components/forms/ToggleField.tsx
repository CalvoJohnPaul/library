import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {Switch} from '../ui/Switch';

export interface ToggleFieldProps {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (value: boolean) => void;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	className?: string;
}

export function ToggleField(props: ToggleFieldProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? false,
		onChange: props.onChange,
	});

	return (
		<Switch.Root
			checked={value}
			onCheckedChange={(details) => {
				setValue(details.checked);
			}}
			disabled={props.disabled}
			required={props.required}
			readOnly={props.readOnly}
			invalid={props.invalid}
			className={props.className}
		>
			<Switch.Control>
				<Switch.Thumb />
			</Switch.Control>
			<Switch.HiddenInput />
		</Switch.Root>
	);
}
