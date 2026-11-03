import {Toaster as ArkToaster, type ToastType} from '@ark-ui/react/toast';
import {FrownIcon, InfoIcon, PartyPopperIcon, XIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {toaster} from '@/utils/toaster';
import {FeaturedIcon} from '../FeaturedIcon';
import {Toast} from '../Toast';

export function Toaster() {
	return (
		<ArkToaster toaster={toaster}>
			{(toast) => (
				<Toast.Root>
					<Icon type={toast.type} />
					<div>
						<Title type={toast.type} title={toast.title} />
						<Description type={toast.type} description={toast.description} />
					</div>
					<Toast.CloseTrigger>
						<XIcon />
					</Toast.CloseTrigger>
				</Toast.Root>
			)}
		</ArkToaster>
	);
}

function Icon(props: {type: ToastType | undefined}) {
	return (
		<FeaturedIcon.Root
			size="sm"
			accent={props.type === 'error' ? 'danger' : props.type === 'success' ? 'success' : 'primary'}
		>
			<FeaturedIcon.Icon>
				{props.type === 'error' ? (
					<FrownIcon />
				) : props.type === 'success' ? (
					<PartyPopperIcon />
				) : (
					<InfoIcon />
				)}
			</FeaturedIcon.Icon>
		</FeaturedIcon.Root>
	);
}

function Title(props: {type: ToastType | undefined; title: ReactNode | undefined}) {
	return (
		<Toast.Title>
			{props.title
				? props.title
				: props.type === 'error'
					? 'Error'
					: props.type === 'success'
						? 'Success'
						: null}
		</Toast.Title>
	);
}

function Description(props: {type: ToastType | undefined; description: ReactNode | undefined}) {
	return (
		<Toast.Description>
			{props.description
				? props.description
				: props.type === 'error'
					? 'Something went wrong'
					: props.type === 'success'
						? 'Request has been processed'
						: null}
		</Toast.Description>
	);
}
