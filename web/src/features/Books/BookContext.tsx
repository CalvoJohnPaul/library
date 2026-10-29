import {createContext} from '@ark-ui/react';
import type {Book} from '@library/types';

export const [BookProvider, useBookContext] = createContext<Book>();
