import { atom } from 'jotai';
import type { Venta, Producto } from './types';
import { productos as productosIniciales } from './data';

/**
 * Jotai atoms are used for global state management.
 * They are conceptually similar to React's `useState` but can be accessed and updated from any component.
 * This is useful for sharing state between pages or deeply nested components without prop drilling.
 *
 * @see https://jotai.org/docs/core/atom
 */

// Atom to store the list of all sales transactions.
export const ventasAtom = atom<Venta[]>([]);

// Atom to store the list of products.
// This allows product data to be modified globally (e.g., updating stock after a sale).
export const productosAtom = atom<Producto[]>(productosIniciales);

    