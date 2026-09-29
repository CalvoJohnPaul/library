import {createContext} from '@ark-ui/react';
import type {UseDisclosureReturn} from '@/hooks/useDisclosure';
import type {UseDataTableReturn} from './useDataTable';

export const [DataTableProvider, useDataTableContext] = createContext<UseDataTableReturn>();
export const [FiltersProvider, useFiltersContext] = createContext<UseDisclosureReturn>();
export const [ColumnsControlProvider, useColumnsControlContext] =
	createContext<UseDisclosureReturn>();
