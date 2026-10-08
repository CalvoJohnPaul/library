import {createContext} from '@ark-ui/react';
import type {Stats} from '@library/types';

export const [DashboardProvider, useDashboardContext] = createContext<Stats>();
