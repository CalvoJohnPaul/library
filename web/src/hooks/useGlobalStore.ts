import {isFunction, pick} from 'es-toolkit';
import type {Dispatch, SetStateAction} from 'react';
import {persist} from 'zustand/middleware';
import {create} from 'zustand/react';

export interface GlobalStore {
	sidebarCollapsed: boolean;
	setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
}

export const useGlobalStore = create<GlobalStore>()(
	persist(
		(set) => ({
			sidebarCollapsed: false,
			setSidebarCollapsed(value) {
				set(({sidebarCollapsed}) => ({sidebarCollapsed: callIfFn(value, sidebarCollapsed)}));
			},
		}),
		{
			name: 'library/global-store',
			partialize: (v) => pick(v, ['sidebarCollapsed']),
		},
	),
);

function callIfFn<T, Args>(v: T | ((...args: Args[]) => T), ...args: Args[]): T {
	return isFunction(v) ? v(...args) : v;
}
