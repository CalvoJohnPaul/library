import {ark} from '@ark-ui/react/factory';
import {XIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {tagsRecipe} from './Tags.recipe';

const {withProvider, withContext} = createRecipeContext(tagsRecipe);

export const Root = withProvider(ark.div, 'root');
export const Item = withProvider(ark.div, 'item');
export const ItemText = withContext(ark.span, 'itemText');
export const ItemCloseTrigger = withContext(ark.button, 'itemCloseTrigger', {
	defaultProps: {
		children: <XIcon />,
	},
});
