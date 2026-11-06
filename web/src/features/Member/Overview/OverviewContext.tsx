import {createContext} from '@ark-ui/react';
import type {MemberStats} from '@library/types';

export const [OverviewProvider, useOverviewContext] = createContext<MemberStats>();
