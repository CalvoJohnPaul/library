import {NumberInput} from '@ark-ui/react/number-input';
import {ChevronDownIcon, ChevronUpIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {numberInputRecipe} from './NumberInput.recipe';

const {withContext, withProvider} = createRecipeContext(numberInputRecipe);

export const Root = withProvider(NumberInput.Root, 'root');
export const Control = withContext(NumberInput.Control, 'control');
export const DecrementTrigger = withContext(NumberInput.DecrementTrigger, 'decrementTrigger', {
	defaultProps: {
		children: <ChevronDownIcon />,
	},
});
export const IncrementTrigger = withContext(NumberInput.IncrementTrigger, 'incrementTrigger', {
	defaultProps: {
		children: <ChevronUpIcon />,
	},
});
export const Input = withContext(NumberInput.Input, 'input');
export const Label = withContext(NumberInput.Label, 'label');
export const Scrubber = withContext(NumberInput.Scrubber, 'scrubber');
export const ValueText = withContext(NumberInput.ValueText, 'valueText');
export const Context = NumberInput.Context;
