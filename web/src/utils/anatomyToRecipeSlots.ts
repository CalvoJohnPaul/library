import type {AnatomyInstance} from '@ark-ui/react/anatomy';

/**
 *
 * Converts a component anatomy into a valid tailwind variant slot recipe
 * and optionally, accepts initial base styles.
 *
 * @example
 * ```ts
 * import { dialogAnatomy } from '@ark-ui/react/dialog';
 * import { anatomyToRecipeSlots } from '../utils/anatomyToRecipeSlots';
 * import { tv } from 'tailwind-variants';
 *
 * const recipe = tv({
 *   slots: anatomyToRecipeSlots(dialogAnatomy, {
 *     backdrop: 'bg-black/30 backdrop-blur-sm fixed inset-0 z-backdrop',
 *     ...
 *   }),
 *  ...
 * });
 *
 */
export function anatomyToRecipeSlots<T extends string>(
	anatomy: AnatomyInstance<T>,
	baseStyles: Partial<Record<T, string | string[]>> = {},
) {
	const styles = anatomy.keys().reduce<Partial<Record<T, string | string[]>>>((acc, key) => {
		acc[key] = baseStyles[key] ?? '';
		return acc;
	}, {});

	return styles as Record<T, string | string[]>;
}
