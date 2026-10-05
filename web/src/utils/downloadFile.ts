import {FailedHttpResponseDefinition} from '@library/types';

export async function downloadFile(res: Response, filename: string) {
	if (!res.ok) {
		const obj = FailedHttpResponseDefinition.parse(await res.json());

		const err = new Error();
		err.name = obj.error.name;
		err.message = obj.error.message;
		throw err;
	}

	const blob = await res.blob();
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');

	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}
