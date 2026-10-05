import {createContext} from '@ark-ui/react';
import type {Member} from '@library/types';

export const [MemberProvider, useMemberContext] = createContext<Member>();
