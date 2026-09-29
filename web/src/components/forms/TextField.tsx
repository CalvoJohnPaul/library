import {dataAttr, useFieldContext} from '@ark-ui/react';
import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {fieldRecipe} from '../ui/Field/Field.recipe';

export interface TextFieldProps {
	type?: 'text' | 'email' | 'url';
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	readOnly?: boolean;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
}

export function TextField(props: TextFieldProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? '',
		onChange: props.onChange,
	});

	const field = useFieldContext();

	return (
		<input
			id={field.ids.control}
			type="text"
			value={value}
			onChange={(e) => {
				setValue(e.target.value);
			}}
			disabled={props.disabled ?? field?.disabled}
			readOnly={props.readOnly ?? field?.readOnly}
			required={props.required ?? field?.required}
			autoComplete="off"
			placeholder={props.placeholder}
			aria-invalid={props.invalid ?? field?.invalid}
			data-required={dataAttr(props.required ?? field?.required)}
			data-disabled={dataAttr(props.disabled ?? field?.disabled)}
			data-readonly={dataAttr(props.readOnly ?? field?.readOnly)}
			data-invalid={dataAttr(props.invalid ?? field?.invalid)}
			className={fieldRecipe().input({className: props.className})}
		/>
	);
}
