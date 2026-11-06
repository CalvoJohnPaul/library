import {createContext} from '@ark-ui/react';
import type {BookStats} from '@library/types';

export const [OverviewProvider, useOverviewContext] = createContext<BookStats>();
