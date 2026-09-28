import {Toast, Toaster} from '@ark-ui/react';
import {QueryClientProvider} from '@tanstack/react-query';
import {XIcon} from 'lucide-react';
import {Suspense} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router';
import {Book} from './features/Book/Book';
import {Books} from './features/Books/Books';
import {NotFound} from './features/NotFound/NotFound';
import {RootLayout} from './features/RootLayout/RootLayout';
import {Transactions} from './features/Transactions/Transactions';
import {client} from './utils/client';
import {toaster} from './utils/toaster';

export function App() {
	return (
		<QueryClientProvider client={client}>
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
		</QueryClientProvider>
	);
}
