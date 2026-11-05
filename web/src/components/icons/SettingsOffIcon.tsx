import {SettingsIcon} from 'lucide-react';
import {type ComponentPropsWithRef, useId} from 'react';

export function SettingsOffIcon({
	children,
	size = 24,
	...props
}: ComponentPropsWithRef<typeof SettingsIcon>) {
	const maskId = useId();

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			<defs>
				<mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
					<rect width="24" height="24" fill="white" stroke="none" />
					<path d="m3 3 18 18" stroke="black" strokeWidth="6" />
				</mask>
			</defs>
			<g mask={`url(#${maskId})`}>
				<SettingsIcon width="24" height="24" strokeWidth={props.strokeWidth ?? 2} />
			</g>
			<path d="m3 3 18 18" />
			{children}
		</svg>
	);
}
