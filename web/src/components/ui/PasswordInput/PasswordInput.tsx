import {PasswordInput} from '@ark-ui/react';
import {EyeClosedIcon, EyeIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {passwordInputRecipe} from './PasswordInput.recipe';

const {withProvider, withContext} = createRecipeContext(passwordInputRecipe);

export const Root = withProvider(PasswordInput.Root, 'root');
export const Control = withContext(PasswordInput.Control, 'control');
export const Label = withContext(PasswordInput.Label, 'label');
export const Input = withContext(PasswordInput.Input, 'input');
export const VisibilityTrigger = withContext(PasswordInput.VisibilityTrigger, 'visibilityTrigger');
export const Indicator = withContext(PasswordInput.Indicator, 'indicator', {
	defaultProps: {
		asChild: true,
		fallback: <EyeClosedIcon />,
		children: <EyeIcon />,
	},
});
export const Context = PasswordInput.Context;
