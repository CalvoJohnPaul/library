import type {Assign} from '@ark-ui/react';
import {mergeProps} from '@ark-ui/react/utils';
import {get, isNil, omit} from 'es-toolkit/compat';
import * as React from 'react';
import {twMerge} from 'tailwind-merge';
import type {VariantProps} from 'tailwind-variants';
import {splitProps} from './splitProps';

type GenericProps = Record<string, any>;
type GenericRecipeEntries = Record<string, (props: GenericProps) => string>;
type GenericRecipe = {
	(props: GenericProps): GenericRecipeEntries;
	variantKeys: (string | number | never)[];
};

export function createRecipeContext<
	Recipe extends GenericRecipe = GenericRecipe,
	RecipeProps extends GenericProps = VariantProps<Recipe>,
	RecipeEntries extends GenericRecipeEntries = ReturnType<Recipe>,
	RecipeEntry = keyof RecipeEntries,
>(recipe: Recipe) {
	const RecipeContext = React.createContext<GenericRecipeEntries | null>(null);

	function useContext() {
		const context = React.useContext(RecipeContext);
		return context;
	}

	function withRootProvider<Props extends GenericProps>(
		Component: React.ComponentType<Props>,
		config?: {defaultProps?: Partial<Props>},
	) {
		const StyledComponent = (props: Props) => {
			const [recipeProps, localProps] = React.useMemo(() => {
				return splitProps(props, ...(recipe.variantKeys as string[]));
			}, [props]);

			const context = recipe(recipeProps);

			const mergedProps = React.useMemo(() => {
				return mergeProps<GenericProps>(config?.defaultProps, localProps) as Props;
			}, [localProps]);

			return (
				<RecipeContext.Provider value={context}>
					<Component {...mergedProps} />
				</RecipeContext.Provider>
			);
		};

		return StyledComponent as unknown as React.ComponentType<Assign<Props, RecipeProps>>;
	}

	function withProvider<Props extends GenericProps>(
		Component: React.ComponentType<Props>,
		slot: RecipeEntry,
		config?: {defaultProps?: Partial<Props>},
	) {
		const StyledComponent = React.forwardRef(function StyledComponent(props, ref) {
			const [recipeProps, localProps] = React.useMemo(() => {
				return splitProps<GenericProps, string>(props, ...(recipe.variantKeys as string[]));
			}, [props]);

			const context = recipe(recipeProps);

			const className = React.useMemo(() => {
				const getStyle = get(localProps, 'unstyled') === true ? null : get(context, slot as string);

				return isNil(getStyle)
					? get(localProps, 'className')
					: get(localProps, 'unstyled') === true
						? get(localProps, 'className')
						: getStyle({
								...recipeProps,
								className: get(localProps, 'className'),
							});
			}, [context, localProps, recipeProps]);

			const mergedProps = React.useMemo(() => {
				return mergeProps<GenericProps>(
					config?.defaultProps,
					omit(localProps, ['unstyled']),
				) as Props;
			}, [localProps]);

			return (
				<RecipeContext.Provider value={context}>
					<Component
						ref={ref}
						{...mergedProps}
						className={twMerge(get(config?.defaultProps ?? {}, 'className'), className)}
					/>
				</RecipeContext.Provider>
			);
		});

		return StyledComponent as React.ComponentType<
			Assign<Props, RecipeProps & {unstyled?: boolean}>
		>;
	}

	function withContext<Props extends GenericProps>(
		Component: React.ComponentType<Props>,
		slot: RecipeEntry,
		config?: {defaultProps?: Partial<Props>},
	) {
		const StyledComponent = React.forwardRef(function StyledComponent(props: GenericProps, ref) {
			const context = useContext();

			const [recipeProps, localProps] = React.useMemo(() => {
				return splitProps(props, ...(recipe.variantKeys as string[]));
			}, [props]);

			const className = React.useMemo(() => {
				const getStyle =
					get(localProps, 'unstyled') === true
						? null
						: context
							? get(context, slot as string)
							: get(recipe(recipeProps), slot as string);

				return isNil(getStyle)
					? get(localProps, 'className')
					: get(localProps, 'unstyled') === true
						? get(localProps, 'className')
						: getStyle({
								...recipeProps,
								className: get(localProps, 'className'),
							});
			}, [context, localProps, recipeProps]);

			const mergedProps = React.useMemo(() => {
				return mergeProps<GenericProps>(
					config?.defaultProps,
					omit(localProps, ['unstyled']),
				) as Props;
			}, [localProps]);

			return (
				<Component
					ref={ref}
					{...mergedProps}
					className={twMerge(get(config?.defaultProps ?? {}, 'className'), className)}
				/>
			);
		});

		return StyledComponent as React.ComponentType<
			Assign<Props, RecipeProps & {unstyled?: boolean}>
		>;
	}

	return {
		withRootProvider,
		withProvider,
		withContext,
	};
}
