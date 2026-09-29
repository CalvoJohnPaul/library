import {ark, type HTMLArkProps} from '@ark-ui/react';
import {splitProps} from '@/utils/splitProps';
import {type IconButtonRecipeProps, iconButtonRecipe} from './IconButton.recipe';

export interface IconButtonProps extends HTMLArkProps<'button'>, IconButtonRecipeProps {
	asChild?: boolean;
}

export function IconButton(props: IconButtonProps) {
	const [recipeProps, localProps] = splitProps(props, ...iconButtonRecipe.variantKeys, 'className');
	return <ark.button type="button" className={iconButtonRecipe(recipeProps)} {...localProps} />;
}
