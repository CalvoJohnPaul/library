import {useParams} from 'react-router';
import {useStudentQuery} from '@/hooks/useStudentQuery';

export function Student() {
	const {id} = useParams<{id: string}>();
	const query = useStudentQuery(id ? parseInt(id, 10) : null);

	if (!id) return null;
	if (query.isLoading) return null;
	if (!query.data) return null /* TODO: Show 404 page */;

	return (
		<>
			<title>{`${query.data.firstName} ${query.data.lastName} | read.`}</title>
			<div></div>
		</>
	);
}
