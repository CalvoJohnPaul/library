import {Toaster} from '@ark-ui/react';
import {QueryClientProvider} from '@tanstack/react-query';
import {FrownIcon, InfoIcon, PartyPopperIcon, XIcon} from 'lucide-react';
import {Suspense} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router';
import {FeaturedIcon} from './components/ui/FeaturedIcon';
import {Toast} from './components/ui/Toast';
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
					<Toast.Root>
						<FeaturedIcon.Root
							size="sm"
							accent={
								toast.type === 'error' ? 'danger' : toast.type === 'success' ? 'primary' : 'info'
							}
						>
							<FeaturedIcon.Icon>
								{toast.type === 'error' ? (
									<FrownIcon />
								) : toast.type === 'success' ? (
									<PartyPopperIcon />
								) : (
									<InfoIcon />
								)}
							</FeaturedIcon.Icon>
						</FeaturedIcon.Root>
						<div>
							<Toast.Title>
								{toast.title
									? toast.title
									: toast.type === 'error'
										? 'Error'
										: toast.type === 'success'
											? 'Success'
											: null}
							</Toast.Title>
							<Toast.Description>
								{toast.description
									? toast.description
									: toast.type === 'error'
										? 'Something went wrong'
										: toast.type === 'success'
											? 'Request has been processed'
											: null}
							</Toast.Description>
						</div>
						<Toast.CloseTrigger>
							<XIcon />
						</Toast.CloseTrigger>
					</Toast.Root>
				)}
			</Toaster>
		</QueryClientProvider>
	);
}
