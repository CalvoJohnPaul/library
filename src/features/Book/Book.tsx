import {useParams} from 'react-router';

export function Book() {
	const {id} = useParams<{id: string}>();

	if (!id) return null;

	console.log(id);

	return null;
}
