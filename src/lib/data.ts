import type { Producto } from './types';

export const productos: Producto[] = [
  {
    id: 'prod-001',
    nombre: 'Laptop Pro 15"',
    stockMinimo: 5,
    ultimaModificacion: '2023-10-26',
    historialVentas: [
      { fecha: '2023-10-01', skuVariante: 'LP-15-256', cantidad: 10 },
      { fecha: '2023-10-01', skuVariante: 'LP-15-512', cantidad: 5 },
    ],
    tasaVentaDiaria: 0.8,
    leadTime: 14,
    variantes: [
      { id: 'var-001a', nombre: '256GB SSD', sku: 'LP-15-256', cantidad: 15, precio: 1200.00 },
      { id: 'var-001b', nombre: '512GB SSD', sku: 'LP-15-512', cantidad: 10, precio: 1400.00 },
    ],
  },
  {
    id: 'prod-002',
    nombre: 'Mouse Inalámbrico Ergo',
    stockMinimo: 20,
    ultimaModificacion: '2023-10-25',
    historialVentas: [
      { fecha: '2023-10-05', skuVariante: 'MS-ERG-BLK', cantidad: 30 },
    ],
    tasaVentaDiaria: 1.5,
    leadTime: 7,
    variantes: [
      { id: 'var-002a', nombre: 'Negro', sku: 'MS-ERG-BLK', cantidad: 8, precio: 45.50 },
      { id: 'var-002b', nombre: 'Blanco', sku: 'MS-ERG-WHT', cantidad: 15, precio: 45.50 },
    ],
  },
  {
    id: 'prod-003',
    nombre: 'Teclado Mecánico RGB',
    stockMinimo: 15,
    ultimaModificacion: '2023-10-26',
    historialVentas: [],
    tasaVentaDiaria: 0.5,
    leadTime: 10,
    variantes: [
      { id: 'var-003a', nombre: 'Switch Rojo', sku: 'KB-MECH-RED', cantidad: 25, precio: 110.00 },
      { id: 'var-003b', nombre: 'Switch Azul', sku: 'KB-MECH-BLU', cantidad: 15, precio: 115.00 },
    ]
  },
  {
    id: 'prod-004',
    nombre: 'Monitor Ultrawide 34"',
    stockMinimo: 5,
    ultimaModificacion: '2023-10-24',
    historialVentas: [],
    tasaVentaDiaria: 0.4,
    leadTime: 21,
    variantes: [
       { id: 'var-004a', nombre: 'Estándar', sku: 'MN-UW-34', cantidad: 12, precio: 750.00 },
    ]
  },
  {
    id: 'prod-005',
    nombre: 'Webcam HD 1080p',
    stockMinimo: 10,
    ultimaModificacion: '2023-10-20',
    historialVentas: [],
    tasaVentaDiaria: 1.2,
    leadTime: 5,
    variantes: [
       { id: 'var-005a', nombre: 'Estándar', sku: 'WC-HD-1080', cantidad: 0, precio: 60.00 },
    ]
  },
];
