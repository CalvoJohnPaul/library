import {Checkbox} from '@ark-ui/react/checkbox';
import {CheckIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {checkboxRecipe} from './Checkbox.recipe';

const {withProvider, withContext} = createRecipeContext(checkboxRecipe);

export const Root = withProvider(Checkbox.Root, 'root');
export const Indicator = withContext(Checkbox.Indicator, 'indicator', {
	defaultProps: {
		asChild: true,
		children: <CheckIcon />,
	},
});
export const Control = withContext(Checkbox.Control, 'control');
export const Group = withContext(Checkbox.Group, 'group');
export const Label = withContext(Checkbox.Label, 'label');
export const HiddenInput = Checkbox.HiddenInput;
export const Context = Checkbox.Context;
