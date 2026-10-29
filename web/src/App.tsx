import {QueryClientProvider} from '@tanstack/react-query';
import {NuqsAdapter} from 'nuqs/adapters/react';
import {Suspense} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router';
import {Toaster} from './components/ui/Toaster';
import {Book} from './features/Book/Book';
import {Books} from './features/Books/Books';
import {Dashboard} from './features/Dashboard/Dashboard';
import {Member} from './features/Member/Member';
import {Members} from './features/Members/Members';
import {NotFound} from './features/NotFound/NotFound';
import {Reservations} from './features/Reservations/Reservations';
import {RootLayout} from './features/RootLayout/RootLayout';
import {Transactions} from './features/Transactions/Transactions';
import {client} from './utils/client';

export function App() {
	return (
		<>
			<NuqsAdapter
				defaultOptions={{
					history: 'push',
				}}
			>
				<QueryClientProvider client={client}>
					<Suspense fallback={null}>
						<BrowserRouter>
							<Routes>
								<Route path="/" element={<RootLayout />}>
									<Route index element={<Dashboard />} />
									<Route path="books" element={<Books />} />
									<Route path="books/:id" element={<Book />} />
									<Route path="transactions" element={<Transactions />} />
									<Route path="members" element={<Members />} />
									<Route path="members/:id" element={<Member />} />
									<Route path="reservations" element={<Reservations />} />
									<Route path="*" element={<NotFound />} />
								</Route>
							</Routes>
						</BrowserRouter>
					</Suspense>
				</QueryClientProvider>
			</NuqsAdapter>
			<Toaster />
		</>
	);
}
