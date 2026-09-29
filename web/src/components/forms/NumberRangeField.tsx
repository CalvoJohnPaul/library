import {useControllableState} from '@radix-ui/react-use-controllable-state';
import type {NumberRange} from '@/types/index';
import {Field} from '../ui/Field';
import {Slider} from '../ui/Slider';
import {NumberField} from './NumberField';

export interface NumberRangeFieldProps {
	value?: NumberRange | null;
	defaultValue?: NumberRange | null;
	onChange?: (value: NumberRange | null) => void;
	disabled?: boolean;
	readOnly?: boolean;
	invalid?: boolean;
	required?: boolean;
	min?: number;
	max?: number;
	className?: string;
}

export function NumberRangeField(props: NumberRangeFieldProps) {
	const [value, setValue] = useControllableState({
		prop: props.value,
		defaultProp: props.defaultValue ?? null,
		onChange: props.onChange,
	});

	return (
		<div className={props.className}>
			<div className="flex items-center gap-2">
				<Field.Root>
					<NumberField
						min={props.min}
						max={props.max}
						value={value?.from ?? null}
						onChange={(n) => {
							setValue((prev) => ({
								from: n ?? prev?.from ?? null,
								to: prev?.to ?? null,
							}));
						}}
						disabled={props.disabled}
						required={props.required}
						readOnly={props.readOnly}
						invalid={props.invalid}
					/>
				</Field.Root>
				<Field.Root>
					<NumberField
						min={props.min}
						max={props.max}
						value={value?.to ?? null}
						onChange={(n) => {
							setValue((prev) => ({
								from: prev?.from ?? null,
								to: n ?? prev?.to ?? null,
							}));
						}}
						disabled={props.disabled}
						required={props.required}
						readOnly={props.readOnly}
						invalid={props.invalid}
					/>
				</Field.Root>
			</div>

			<Field.Root className="mt-4 mb-2">
				<Slider.Root
					value={[value?.from ?? 0, value?.to ?? 0]}
					onValueChange={(details) => {
						setValue({
							from: details.value.at(0) ?? 0,
							to: details.value.at(1) ?? 0,
						});
					}}
					min={props.min ?? 0}
					max={props.max ?? 999999}
					disabled={props.disabled}
					readOnly={props.readOnly}
					invalid={props.invalid}
				>
					<Slider.Control>
						<Slider.Track>
							<Slider.Range />
						</Slider.Track>
						<Slider.Thumb index={0}>
							<Slider.HiddenInput />
						</Slider.Thumb>
						<Slider.Thumb index={1}>
							<Slider.HiddenInput />
						</Slider.Thumb>
					</Slider.Control>
				</Slider.Root>
			</Field.Root>
		</div>
	);
}
