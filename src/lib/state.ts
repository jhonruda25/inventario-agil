
import { atom } from 'jotai';
import type { Empleado } from './types';

/**
 * Jotai atoms are used for global state management.
 * They are conceptually similar to React's `useState` but can be accessed and updated from any component.
 * This is useful for sharing state between pages or deeply nested components without prop drilling.
 *
 * @see https://jotai.org/docs/core/atom
 */

// Atom to track the currently "logged-in" or active employee.
// This is one of the few atoms we'll keep, as it represents client-side session state.
export const empleadoActivoAtom = atom<Empleado | null>(null);
