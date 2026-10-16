import {createContext} from '@ark-ui/react';
import type {Transaction} from '@library/types';

export const [BookCopyProvider, useBookCopyContext] = createContext<Transaction['bookCopy']>();
