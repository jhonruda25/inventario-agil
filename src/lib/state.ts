import { atom } from 'jotai';
import type { Empleado, Producto, Cliente, Venta } from './types';

/**
 * Jotai atoms are used for global state management.
 * They are conceptually similar to React's `useState` but can be accessed and updated from any component.
 * This is useful for sharing state between pages or deeply nested components without prop drilling.
 *
 * @see https://jotai.org/docs/core/atom
 */

// Atom to track the currently "logged-in" or active employee.
export const empleadoActivoAtom = atom<Empleado | null>(null);

// Atoms for managing data during the client-side session.
// These will be initialized with data fetched from the server.
export const productosAtom = atom<Producto[]>([]);
export const clientesAtom = atom<Cliente[]>([]);
export const empleadosAtom = atom<Empleado[]>([]);
export const ventasAtom = atom<Venta[]>([]);