
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import type { Producto, Cliente, Empleado, Venta } from './types';

// --- Funciones para Productos ---

export async function findProducts() {
    const { db } = await connectToDatabase();
    const productos = await db.collection('productos').find({}).toArray();
    return productos.map(p => ({ ...p, id: p._id.toString() })) as Producto[];
}

export async function findProductById(id: string) {
    const { db } = await connectToDatabase();
    const producto = await db.collection('productos').findOne({ _id: new ObjectId(id) });
    if (producto) {
        return { ...producto, id: producto._id.toString() } as Producto;
    }
    return null;
}

export async function insertProduct(producto: Omit<Producto, '_id' | 'id'>) {
    const { db } = await connectToDatabase();
    return await db.collection('productos').insertOne(producto);
}

export async function insertManyProducts(productos: Omit<Producto, '_id' | 'id'>[]) {
    const { db } = await connectToDatabase();
    return await db.collection('productos').insertMany(productos);
}

export async function updateProduct(id: string, producto: Partial<Producto>) {
    const { db } = await connectToDatabase();
    return await db.collection('productos').updateOne({ _id: new ObjectId(id) }, { $set: producto });
}

export async function deleteProduct(id: string) {
    const { db } = await connectToDatabase();
    return await db.collection('productos').deleteOne({ _id: new ObjectId(id) });
}

// --- Funciones para Clientes ---

export async function findClients() {
    const { db } = await connectToDatabase();
    const clientes = await db.collection('clientes').find({}).toArray();
    return clientes.map(c => ({ ...c, id: c._id.toString() })) as Cliente[];
}

export async function insertClient(cliente: Omit<Cliente, '_id' | 'id'>) {
    const { db } = await connectToDatabase();
    return await db.collection('clientes').insertOne(cliente);
}

export async function updateClient(id: string, cliente: Partial<Cliente>) {
    const { db } = await connectToDatabase();
    return await db.collection('clientes').updateOne({ _id: new ObjectId(id) }, { $set: cliente });
}

export async function deleteClient(id: string) {
    const { db } = await connectToDatabase();
    return await db.collection('clientes').deleteOne({ _id: new ObjectId(id) });
}


// --- Funciones para Empleados ---

export async function findEmployees() {
    const { db } = await connectToDatabase();
    const empleados = await db.collection('empleados').find({}).toArray();
    return empleados.map(e => ({ ...e, id: e._id.toString() })) as Empleado[];
}

export async function insertEmployee(empleado: Omit<Empleado, '_id' | 'id'>) {
    const { db } = await connectToDatabase();
    return await db.collection('empleados').insertOne(empleado);
}

export async function updateEmployee(id: string, empleado: Partial<Empleado>) {
    const { db } = await connectToDatabase();
    return await db.collection('empleados').updateOne({ _id: new ObjectId(id) }, { $set: empleado });
}

export async function deleteEmployee(id: string) {
    const { db } = await connectToDatabase();
    return await db.collection('empleados').deleteOne({ _id: new ObjectId(id) });
}

// --- Funciones para Ventas ---

export async function findVentas() {
    const { db } = await connectToDatabase();
    const ventas = await db.collection('ventas').find({}).sort({ fecha: -1 }).toArray();
    return ventas.map(v => ({ ...v, id: v._id.toString() })) as Venta[];
}

export async function findVentaById(id: string) {
    const { db } = await connectToDatabase();
    const venta = await db.collection('ventas').findOne({ _id: new ObjectId(id) });
    if (venta) {
        return { ...venta, id: venta._id.toString() } as Venta;
    }
    return null;
}

export async function insertSale(venta: Omit<Venta, '_id' | 'id'>) {
    const { db } = await connectToDatabase();
    return await db.collection('ventas').insertOne(venta);
}

export async function updateVenta(id: string, venta: Partial<Venta>) {
    const { db } = await connectToDatabase();
    return await db.collection('ventas').updateOne({ _id: new ObjectId(id) }, { $set: venta });
}


// --- DATOS INICIALES PARA SEED ---

export const productos: Omit<Producto, '_id' | 'id'>[] = [
  {
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


export const clientes: Omit<Cliente, '_id' | 'id'>[] = [
    {
        nombre: 'Carlos Ramírez',
        email: 'carlos.r@email.com',
        telefono: '3101234567',
        historialVentasIds: [],
        puntos: 150
    },
    {
        nombre: 'Luisa Fernanda',
        email: 'luisa.f@email.com',
        telefono: '3209876543',
        historialVentasIds: [],
        puntos: 45
    }
];

export const empleados: Omit<Empleado, '_id' | 'id'>[] = [
    {
        nombre: 'Ana García (Admin)',
        rol: 'administrador',
        pin: '1234'
    },
    {
        nombre: 'Juan Pérez (Cajero)',
        rol: 'cajero',
        pin: '5678'
    },
    {
        nombre: 'Marta Rivas (Inventario)',
        rol: 'inventario',
        pin: '1122'
    }
];
