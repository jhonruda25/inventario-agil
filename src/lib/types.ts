export type Variante = {
  id: string;
  nombre: string; // E.g., "Rojo", "Talla M"
  sku: string;
  cantidad: number;
  precio: number;
};

export type Producto = {
  id: string;
  nombre: string;
  descripcion?: string; // Descripción general del producto
  // Estos campos se mueven a las variantes o se calculan a partir de ellas
  // sku: string;
  // cantidad: number;
  // precio: number;
  stockMinimo: number; // Se puede aplicar a nivel de producto o por variante
  ultimaModificacion: string;
  historialVentas: { fecha: string, skuVariante: string, cantidad: number }[];
  tasaVentaDiaria: number; // Podría ser un promedio de todas las variantes
  leadTime: number;
  variantes: Variante[];
};
