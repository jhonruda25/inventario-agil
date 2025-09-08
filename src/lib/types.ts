export type Producto = {
  id: string;
  nombre: string;
  sku: string;
  cantidad: number;
  stockMinimo: number;
  precio: number;
  ultimaModificacion: string;
  historialVentas: { fecha: string, cantidad: number }[];
  tasaVentaDiaria: number;
  leadTime: number;
};
