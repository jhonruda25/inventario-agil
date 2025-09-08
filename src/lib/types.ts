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
  stockMinimo: number; // Se puede aplicar a nivel de producto o por variante
  ultimaModificacion: string;
  historialVentas: { fecha: string, skuVariante: string, cantidad: number }[];
  tasaVentaDiaria: number; // Podría ser un promedio de todas las variantes
  leadTime: number;
  variantes: Variante[];
};

export type CarritoItem = {
  productoId: string;
  variante: Variante;
  nombreProducto: string;
  cantidadEnCarrito: number;
};

export type Venta = {
  id: string;
  items: CarritoItem[];
  total: number;
  metodoPago: string;
  montoPagado: number | null;
  cambio: number | null;
  fecha: Date;
  estado: 'completada' | 'devuelta';
}

    