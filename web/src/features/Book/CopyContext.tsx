import {createContext} from '@ark-ui/react';
import type {BookCopy} from '@library/types';

export const [CopyProvider, useCopyContext] = createContext<BookCopy>();
