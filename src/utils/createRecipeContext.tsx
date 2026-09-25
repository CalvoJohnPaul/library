import type {Assign} from '@ark-ui/react';
import {mergeProps} from '@ark-ui/react/utils';
import {get, isNil} from 'es-toolkit/compat';
import * as React from 'react';
import {twJoin} from 'tailwind-merge';
import type {VariantProps} from 'tailwind-variants';
import {splitProps} from './splitProps';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericProps = Record<string, any>;
type GenericRecipeEntries = Record<string, (props: GenericProps) => string>;
type GenericRecipe = {
	(props: GenericProps): GenericRecipeEntries;
	variantKeys: (string | number | never)[];
};

/**
 *
 * @example
 * ```tsx
 * import { tv } from 'tailwind-variants';
 *
 * // Component.recipe.ts
 * const componentRecipe = tv({
 *  slots: {
 *    root: 'bg-red',
 *    icon: 'text-white',
 *  },
 *  ...
 * });
 *
 * // Component.tsx
 * const { withProvider, withContext } = createRecipeContext(componentRecipe);
 *
 * export const Root = withProvider(ark.div, 'root');
 * export const Icon = withContext(ark.svg, 'icon', {
 *   asChild: true
 * });
 *
 * ```
 *
 */
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
		defaultProps: Partial<Props> = {},
	) {
		const StyledComponent = (props: Props) => {
			const [recipeProps, localProps] = React.useMemo(() => {
				return splitProps(props, recipe.variantKeys as string[]);
			}, [props]);

			const context = recipe(recipeProps);

			const mergedProps = React.useMemo(() => {
				return mergeProps<GenericProps>(defaultProps, localProps) as Props;
			}, [localProps]);

			return (
				<RecipeContext.Provider value={context}>
					<Component {...mergedProps} />
				</RecipeContext.Provider>
			);
		};

		return StyledComponent as unknown as React.ComponentType<
			Assign<Props, RecipeProps>
		>;
	}

	function withProvider<Props extends GenericProps>(
		Component: React.ComponentType<Props>,
		slot: RecipeEntry,
		defaultProps: Partial<Props> = {},
	) {
		const StyledComponent = React.forwardRef((props, ref) => {
			const [recipeProps, localProps] = React.useMemo(() => {
				return splitProps<GenericProps, string>(
					props,
					recipe.variantKeys as string[],
				);
			}, [props]);

			const context = recipe(recipeProps);

			const className = React.useMemo(() => {
				const getStyle = get(context, slot as string);

				return isNil(getStyle)
					? get(localProps, 'className')
					: getStyle({
							...recipeProps,
							className: get(localProps, 'className'),
						});
			}, [context, localProps, recipeProps]);

			const mergedProps = React.useMemo(() => {
				return mergeProps<GenericProps>(defaultProps, localProps) as Props;
			}, [localProps]);

			return (
				<RecipeContext.Provider value={context}>
					<Component
						ref={ref}
						{...mergedProps}
						className={twJoin(get(defaultProps, 'className'), className)}
					/>
				</RecipeContext.Provider>
			);
		});

		StyledComponent.displayName = Component.displayName || Component.name;

		return StyledComponent as React.ComponentType<Assign<Props, RecipeProps>>;
	}

	function withContext<Props extends GenericProps>(
		Component: React.ComponentType<Props>,
		slot: RecipeEntry,
		defaultProps: Partial<Props> = {},
	) {
		const StyledComponent = React.forwardRef((props: GenericProps, ref) => {
			const context = useContext();

			const [recipeProps, localProps] = React.useMemo(() => {
				return splitProps(props, recipe.variantKeys as string[]);
			}, [props]);

			const className = React.useMemo(() => {
				const getStyle = context
					? get(context, slot as string)
					: get(recipe(recipeProps), slot as string);

				return isNil(getStyle)
					? get(localProps, 'className')
					: getStyle({
							...recipeProps,
							className: get(localProps, 'className'),
						});
			}, [context, localProps, recipeProps]);

			const mergedProps = React.useMemo(() => {
				return mergeProps<GenericProps>(defaultProps, localProps) as Props;
			}, [localProps]);

			return (
				<Component
					ref={ref}
					{...mergedProps}
					className={twJoin(get(defaultProps, 'className'), className)}
				/>
			);
		});

		StyledComponent.displayName = Component.displayName || Component.name;

		return StyledComponent as React.ComponentType<Assign<Props, RecipeProps>>;
	}

	return {
		withRootProvider,
		withProvider,
		withContext,
	};
}
