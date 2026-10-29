import {createContext} from '@ark-ui/react';
import type {BookCopy} from '@library/types';

export const [BookCopyProvider, useBookCopyContext] = createContext<BookCopy>();
