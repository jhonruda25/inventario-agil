
import type { Producto, Cliente } from './types';

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
      { id: 'var-001a', nombre: '256GB SSD', sku: 'LP-15-256', cantidad: 15, precio: 4500000 },
      { id: 'var-001b', nombre: '512GB SSD', sku: 'LP-15-512', cantidad: 10, precio: 5200000 },
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
      { id: 'var-002a', nombre: 'Negro', sku: 'MS-ERG-BLK', cantidad: 8, precio: 180000 },
      { id: 'var-002b', nombre: 'Blanco', sku: 'MS-ERG-WHT', cantidad: 15, precio: 180000 },
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
      { id: 'var-003a', nombre: 'Switch Rojo', sku: 'KB-MECH-RED', cantidad: 25, precio: 420000 },
      { id: 'var-003b', nombre: 'Switch Azul', sku: 'KB-MECH-BLU', cantidad: 15, precio: 435000 },
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
       { id: 'var-004a', nombre: 'Estándar', sku: 'MN-UW-34', cantidad: 12, precio: 2800000 },
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
       { id: 'var-005a', nombre: 'Estándar', sku: 'WC-HD-1080', cantidad: 0, precio: 250000 },
    ]
  },
];


export const clientes: Cliente[] = [
    {
        id: 'cli-001',
        nombre: 'Carlos Ramírez',
        email: 'carlos.r@email.com',
        telefono: '3101234567',
        historialVentasIds: [],
        puntos: 150
    },
    {
        id: 'cli-002',
        nombre: 'Luisa Fernanda',
        email: 'luisa.f@email.com',
        telefono: '3209876543',
        historialVentasIds: [],
        puntos: 45
    }
]
