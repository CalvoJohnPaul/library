import {useEffect} from 'react';
import {Outlet} from 'react-router';
import {Navbar} from './Navbar';

export function RootLayout() {
	useEffect(() => {
		const timeout = setTimeout(hideSplash, 1500);

		return () => {
			clearTimeout(timeout);
			showSplash();
		};
	}, []);

	return (
		<>
			<Navbar />
			<main>
				<Outlet />
			</main>
		</>
	);
}

let __splash: HTMLElement | null = null;
let __splash_css: CSSStyleDeclaration | null = null;

function hideSplash() {
	if (!__splash) __splash = document.getElementById('splash');
	if (!__splash) return;
	if (!__splash_css) __splash_css = getComputedStyle(__splash);
	__splash.hidden = true;
	__splash.style.display = 'none';
}

function showSplash() {
	if (!__splash) __splash = document.getElementById('splash');
	if (!__splash) return;
	__splash.hidden = false;
	__splash.style.display = __splash_css?.display ?? '';
}
