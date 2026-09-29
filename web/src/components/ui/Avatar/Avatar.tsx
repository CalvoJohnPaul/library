import {Avatar} from '@ark-ui/react/avatar';
import {UserIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {avatarRecipe} from './Avatar.recipe';

const {withProvider, withContext} = createRecipeContext(avatarRecipe);

export const Root = withProvider(Avatar.Root, 'root');
export const Image = withContext(Avatar.Image, 'image');
export const Fallback = withContext(Avatar.Fallback, 'fallback', {
	defaultProps: {
		children: <UserIcon />,
	},
});
export const Context = Avatar.Context;
