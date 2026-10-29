import {createContext} from '@ark-ui/react';
import type {Reservation} from '@library/types';

export const [ReservationProvider, useReservationContext] = createContext<Reservation>();
