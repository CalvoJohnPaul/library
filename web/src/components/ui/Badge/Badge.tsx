import {ark} from '@ark-ui/react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {badgeRecipe} from './Badge.recipe';

const {withProvider, withContext} = createRecipeContext(badgeRecipe);

export const Root = withProvider(ark.div, 'root');
export const Label = withContext(ark.span, 'label');
export const Icon = withContext(ark.svg, 'icon', {
	defaultProps: {
		asChild: true,
	},
});
