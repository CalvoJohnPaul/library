import {useEffect} from 'react';
import {Outlet} from 'react-router';
import {useMeQuery} from '@/hooks/useMeQuery';
import {useNetworkState} from '@/hooks/useNetworkState';
import {Login} from './Login';
import {Navbar} from './Navbar';

export function RootLayout() {
	const query = useMeQuery();
	const networkState = useNetworkState();

	console.log(networkState);

	useEffect(() => {
		const interval = setInterval(() => {
			if (!query.isFetched) return;
			hideSplash();
			clearInterval(interval);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [query.isFetched]);

	if (!query.data) return <Login />;

	return (
		<>
			<Navbar />
			<main className="mx-auto max-w-344 p-12">
				<Outlet />
			</main>
		</>
	);
}

function hideSplash() {
	const splash = document.getElementById('splash');
	if (!splash) return;
	splash.hidden = true;
	splash.style.display = 'none';
}
