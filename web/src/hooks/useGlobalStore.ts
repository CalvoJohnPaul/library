import {isFunction, pick} from 'es-toolkit';
import type {Dispatch, SetStateAction} from 'react';
import {persist} from 'zustand/middleware';
import {create} from 'zustand/react';

export interface GlobalStore {
	sidebarHidden: boolean;
	setSidebarHidden: Dispatch<SetStateAction<boolean>>;
}

export const useGlobalStore = create<GlobalStore>()(
	persist(
		(set) => ({
			sidebarHidden: false,
			setSidebarHidden(value) {
				set(({sidebarHidden}) => ({sidebarHidden: callIfFn(value, sidebarHidden)}));
			},
		}),
		{
			name: 'library/global-store',
			partialize: (v) => pick(v, ['sidebarHidden']),
		},
	),
);

function callIfFn<T, Args>(v: T | ((...args: Args[]) => T), ...args: Args[]): T {
	return isFunction(v) ? v(...args) : v;
}
