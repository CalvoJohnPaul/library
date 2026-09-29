import {useControllableState} from '@radix-ui/react-use-controllable-state';
import type {ComponentProps, Dispatch, SetStateAction} from 'react';

export interface UseDisclosureProps {
	open?: boolean;
	onChange?: (value: boolean) => void;
	defaultOpen?: boolean;
}

export interface UseDisclosureReturn {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	getDisclosureProps: () => ComponentProps<'button'>;
}

export function useDisclosure(props?: UseDisclosureProps): UseDisclosureReturn {
	const [open, setOpen] = useControllableState({
		prop: props?.open,
		defaultProp: props?.defaultOpen ?? false,
		onChange: props?.onChange,
	});

	return {
		open,
		setOpen,
		getDisclosureProps() {
			return {
				type: 'button',
				onClick() {
					setOpen((prev) => !prev);
				},
				'data-state': open ? 'open' : 'closed',
			};
		},
	};
}
