

export type Variante = {
  id: string; // Puede ser un UUID o un ID generado
  nombre: string; // E.g., "Rojo", "Talla M"
  sku: string;
  cantidad: number;
  precio: number;
};

// Como se almacena en la BD
export type Producto = {
  _id?: string; // MongoDB ID
  id?: string;
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

export type Cliente = {
    _id?: string; // MongoDB ID
    id?: string;
    nombre: string;
    email: string;
    telefono: string;
    historialVentasIds: string[];
    puntos: number;
}

export type RolEmpleado = 'administrador' | 'cajero' | 'inventario';

export type Empleado = {
    _id?: string; // MongoDB ID
    id?: string;
    nombre: string;
    rol: RolEmpleado;
    pin: string;
}

export type Venta = {
  _id?: string; // MongoDB ID
  id?: string;
  clienteId: string | null;
  empleadoId: string;
  items: CarritoItem[];
  subtotal: number;
  total: number;
  descuento?: {
    tipo: 'porcentaje' | 'fijo';
    valor: number;
  };
  metodoPago: string;
  montoPagado: number | null;
  cambio: number | null;
  fecha: Date;
  estado: 'completada' | 'devuelta';
}
