import {createContext} from '@ark-ui/react';
import type {Student} from '@library/types';

export const [StudentProvider, useStudentContext] = createContext<Student>();
