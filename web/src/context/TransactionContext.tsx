import {createContext} from '@ark-ui/react';
import type {Transaction} from '@library/types';

export const [TransactionProvider, useTransactionContext] = createContext<Transaction>();
