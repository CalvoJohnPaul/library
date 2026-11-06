import {CloudMoonIcon, CloudSunIcon} from 'lucide-react';
import type {ComponentPropsWithRef} from 'react';
import {cx} from 'tailwind-variants';
import {useThemeContext} from '@/providers/ThemeProvider';

export function ThemeToggle(props: ComponentPropsWithRef<'button'>) {
	const {onClick, className, children, ...rest} = props;
	const [theme, setTheme] = useThemeContext();

	return (
		<button
			type="button"
			className={cx(
				'flex shrink-0 items-center justify-center text-neutral-700 dark:text-neutral-300',
				className,
			)}
			onClick={(e) => {
				props.onClick?.(e);
				setTheme(theme === 'dark' ? 'light' : 'dark');
			}}
			{...rest}
		>
			{children ? (
				children
			) : theme === 'dark' ? (
				<CloudSunIcon className="size-5.5" />
			) : (
				<CloudMoonIcon className="size-5.5" />
			)}
		</button>
	);
}
