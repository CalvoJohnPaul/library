import {useEffect, useEffectEvent} from 'react';

export function useTimeout(callback: () => void, delay: number | null): void {
	const onTick = useEffectEvent(callback);

	useEffect(() => {
		if (delay === null) {
			return;
		}

		const id = window.setTimeout(() => {
			onTick();
		}, delay);

		return () => {
			window.clearTimeout(id);
		};
	}, [delay]);
}
