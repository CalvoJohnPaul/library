import {ark, type HTMLArkProps} from '@ark-ui/react';
import {splitProps} from '@/utils/splitProps';
import {type ButtonRecipeProps, buttonRecipe} from './Button.recipe';

export interface ButtonProps extends HTMLArkProps<'button'>, ButtonRecipeProps {
	asChild?: boolean;
}

export function Button(props: ButtonProps) {
	const [recipeProps, localProps] = splitProps(props, [...buttonRecipe.variantKeys, 'className']);
	return <ark.button className={buttonRecipe(recipeProps)} {...localProps} />;
}
