import {createContext} from '@ark-ui/react';
import type {BookCopy} from '@library/types';

export type CopyContextValue = Pick<BookCopy, 'id' | 'isbn' | 'status' | 'book'>;

export const [CopyProvider, useCopyContext] = createContext<CopyContextValue>();
