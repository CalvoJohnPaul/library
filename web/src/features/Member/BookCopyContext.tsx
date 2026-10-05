import {createContext} from '@ark-ui/react';
import type {BookCopy} from '@library/types';

export type BookCopyContextValue = Pick<BookCopy, 'id' | 'isbn' | 'status' | 'book'>;

export const [BookCopyProvider, useBookCopyContext] = createContext<BookCopyContextValue>();
