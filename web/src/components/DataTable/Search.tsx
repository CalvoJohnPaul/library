import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {SearchIcon} from 'lucide-react';
import {useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';
import {TextField, type TextFieldProps} from '../forms/TextField';
import {Field} from '../ui/Field';
import {useDataTableContext} from './DataTableContext';

export function Search() {
	const {searchEnabled, search, setSearch} = useDataTableContext();

	if (!searchEnabled) return null;

	return (
		<Field.Root className="relative w-80">
			<SearchIcon className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-neutral-300" />
			<DebouncedTextField
				placeholder="Search"
				value={search}
				onChange={setSearch}
				className="pr-10"
			/>
		</Field.Root>
	);
}

function DebouncedTextField({value, defaultValue, onChange, ...props}: TextFieldProps) {
	const [value__external, setValue__external] = useControllableState({
		prop: value,
		defaultProp: defaultValue ?? '',
		onChange,
	});

	const [value__internal, setValue__internal] = useState(value__external);
	const setValue__debounced = useDebounceCallback(setValue__external, 250);

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
