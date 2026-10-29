import {useEffect} from 'react';
import {Outlet} from 'react-router';
import {useMeQuery} from '@/hooks/useMeQuery';
import {Login} from './Login';
import {Navbar} from './Navbar';
import {Sidebar} from './Sidebar';

export function RootLayout() {
	const query = useMeQuery();

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
			<div className="relative flex w-full items-start">
				<Sidebar />
				<main className="min-w-0 grow p-12">
					<Outlet />
				</main>
			</div>
		</>
	);
}

function hideSplash() {
	const splash = document.getElementById('splash');
	if (!splash) return;
	splash.hidden = true;
	splash.style.display = 'none';
}
