'use server';

import { sugerirReposicionStock, type SugerirReposicionStockInput, type SugerirReposicionStockOutput } from '@/ai/flows/sugerencia-reposicion-stock';

export async function obtenerSugerenciaReposicion(input: SugerirReposicionStockInput): Promise<SugerirReposicionStockOutput> {
  try {
    const sugerencia = await sugerirReposicionStock(input);
    return sugerencia;
  } catch (error) {
    console.error('Error al obtener sugerencia de la IA:', error);
    // En un caso real, podríamos devolver un objeto de error estandarizado.
    // Por ahora, relanzamos el error para que el cliente lo maneje.
    throw new Error('No se pudo generar la sugerencia. Inténtelo de nuevo.');
  }
}
