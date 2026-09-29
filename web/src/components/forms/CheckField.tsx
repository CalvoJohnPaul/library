import {useControllableState} from '@radix-ui/react-use-controllable-state';
import type {ReactNode} from 'react';
import {Checkbox} from '../ui/Checkbox';

export interface CheckFieldProps {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (value: boolean) => void;
	children?: ReactNode;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	className?: string;
}

export function CheckField(props: CheckFieldProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? false,
		onChange: props.onChange,
	});

	return (
		<Checkbox.Root
			checked={value}
			onCheckedChange={(details) => {
				if (details.checked === 'indeterminate') return;
				setValue(details.checked);
			}}
			disabled={props.disabled}
			required={props.required}
			readOnly={props.readOnly}
			invalid={props.invalid}
			className={props.className}
		>
			<Checkbox.Control>
				<Checkbox.Indicator />
			</Checkbox.Control>
			{props.children && <Checkbox.Label>{props.children}</Checkbox.Label>}
			<Checkbox.HiddenInput />
		</Checkbox.Root>
	);
}
