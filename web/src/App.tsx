import {Toast, Toaster} from '@ark-ui/react';
import {XIcon} from 'lucide-react';
import {lazy, Suspense} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router';
import {RootLayout} from './features/RootLayout/RootLayout';
import {Transactions} from './features/Transactions/Transactions';
import {toaster} from './utils/toaster';

const Books = lazy(() => import('./features/Books/Books').then((m) => ({default: m.Books})));

const Book = lazy(() => import('./features/Book/Book').then((m) => ({default: m.Book})));

const NotFound = lazy(() =>
	import('./features/NotFound/NotFound').then((m) => ({default: m.NotFound})),
);

export function App() {
	return (
		<>
			<Suspense fallback={null}>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<RootLayout />}>
							<Route index element={<Books />} />
							<Route path=":id" element={<Book />} />
							<Route path="transactions" element={<Transactions />} />
							<Route path="*" element={<NotFound />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</Suspense>
			<Toaster toaster={toaster}>
				{(toast) => (
					<Toast.Root key={toast.id}>
						<Toast.Title>{toast.title}</Toast.Title>
						<Toast.Description>{toast.description}</Toast.Description>
						<Toast.CloseTrigger>
							<XIcon />
						</Toast.CloseTrigger>
					</Toast.Root>
				)}
			</Toaster>
		</>
	);
}
