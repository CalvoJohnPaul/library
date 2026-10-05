import {ArrowLeftIcon} from 'lucide-react';
import {Link} from 'react-router';

export function NotFound() {
	return (
		<div className="mx-auto max-w-md py-24 text-center">
			<title>Page not found | read.</title>
			<p className="font-extrabold text-6xl text-gray-200">404</p>
			<h1 className="mt-2 font-bold text-xl">Page not found</h1>
			<p className="mt-1 text-gray-600 text-sm">
				The page you are looking for does not exist or has been moved.
			</p>
			<Link to="/books" className="mt-5 inline-flex items-center gap-1 text-blue-500 text-sm">
				<ArrowLeftIcon className="size-3.5" />
				Go to books
			</Link>
		</div>
	);
}
