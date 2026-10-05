import {ArrowLeftIcon} from 'lucide-react';
import {Link} from 'react-router';
import {Button} from '@/components/ui/Button';

export function NotFound() {
	return (
		<div className="mx-auto max-w-md py-24 text-center">
			<title>Page not found | read.</title>
			<h1 className="mt-5 font-bold text-xl">Page not found</h1>
			<p className="mt-1 text-gray-600 text-sm">
				The page you are looking for no longer exists or has been removed.
			</p>
			<Button asChild variant="outline" accent="gray" className="mt-6">
				<Link to="/books">
					<ArrowLeftIcon />
					Go to books
				</Link>
			</Button>
		</div>
	);
}
