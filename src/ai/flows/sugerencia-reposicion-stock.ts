'use server';

/**
 * @fileOverview AI flow para sugerir cantidades de reposición de stock.
 *
 * - sugerirReposicionStock - Función principal que genera la sugerencia de reposición.
 * - SugerirReposicionStockInput - Tipo de entrada para la función sugerirReposicionStock.
 * - SugerirReposicionStockOutput - Tipo de salida para la función sugerirReposicionStock.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SugerirReposicionStockInputSchema = z.object({
  historialVentas: z.string().describe('Historial de ventas del producto en formato JSON.'),
  stockActual: z.number().describe('Cantidad actual en stock del producto.'),
  leadTime: z.number().describe('Tiempo de entrega del proveedor en días.'),
  tasaVentaDiaria: z.number().describe('Tasa de venta diaria del producto.'),
});

export type SugerirReposicionStockInput = z.infer<typeof SugerirReposicionStockInputSchema>;

const SugerirReposicionStockOutputSchema = z.object({
  cantidadRecomendada: z.number().describe('Cantidad recomendada para reponer el stock.'),
  razonamiento: z.string().describe('Explicación del razonamiento para la cantidad recomendada.'),
});

export type SugerirReposicionStockOutput = z.infer<typeof SugerirReposicionStockOutputSchema>;

export async function sugerirReposicionStock(input: SugerirReposicionStockInput): Promise<SugerirReposicionStockOutput> {
  return sugerirReposicionStockFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sugerirReposicionStockPrompt',
  input: {schema: SugerirReposicionStockInputSchema},
  output: {schema: SugerirReposicionStockOutputSchema},
  prompt: `Eres un experto en gestión de inventarios. Basado en el historial de ventas, el stock actual y el lead time, determina la cantidad óptima para reponer el stock de un producto.

  Historial de ventas: {{{historialVentas}}}
  Stock actual: {{{stockActual}}}
  Lead time (días): {{{leadTime}}}
  Tasa de venta diaria: {{{tasaVentaDiaria}}}

  Calcula la cantidad recomendada para reponer el stock y justifica tu respuesta.
  Asegúrate de considerar el lead time para evitar quedarte sin stock durante ese período.
  Indica la cantidad recomendada en el campo 'cantidadRecomendada' y tu justificación en el campo 'razonamiento'.`,
});

const sugerirReposicionStockFlow = ai.defineFlow(
  {
    name: 'sugerirReposicionStockFlow',
    inputSchema: SugerirReposicionStockInputSchema,
    outputSchema: SugerirReposicionStockOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


