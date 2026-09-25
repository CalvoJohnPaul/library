import {SpinnerIcon} from '@/components/icons/SpinnerIcon';
import {Suspense} from 'react';
import {Outlet} from 'react-router';

export function RootLayout() {
	return (
		<Suspense fallback={<Loader />}>
			<Outlet />
		</Suspense>
	);
}

function Loader() {
	return (
		<div className="p-4">
			<SpinnerIcon />
		</div>
	);
}
