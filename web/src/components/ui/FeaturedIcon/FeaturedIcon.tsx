import {ark} from '@ark-ui/react/factory';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {featuredIconRecipe} from './FeaturedIcon.recipe';

const {withProvider, withContext} = createRecipeContext(featuredIconRecipe);

export const Root = withProvider(ark.div, 'root');
export const Icon = withContext(ark.svg, 'icon', {
	defaultProps: {
		asChild: true,
	},
});
