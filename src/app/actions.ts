'use server';

import { sugerirReposicionStock, type SugerirReposicionStockInput, type SugerirReposicionStockOutput } from '@/ai/flows/sugerencia-reposicion-stock';
import { connectToDatabase } from '@/lib/mongodb';
import type { Cliente, Empleado, Producto, Venta } from '@/lib/types';
import { ObjectId } from 'mongodb';

// --- Funciones de Productos ---

export async function obtenerProductos() {
  const { db } = await connectToDatabase();
  const productos = await db.collection('productos').find({}).toArray();
  return JSON.parse(JSON.stringify(productos)) as Producto[];
}

export async function guardarProducto(producto: Omit<Producto, 'id'> & { id?: string }) {
  const { db } = await connectToDatabase();
  const { id, ...productoData } = producto;

  if (id) {
    // Actualizar producto existente
    await db.collection('productos').updateOne({ _id: new ObjectId(id) }, { $set: productoData });
    return id;
  } else {
    // Crear nuevo producto
    const result = await db.collection('productos').insertOne(productoData);
    return result.insertedId.toHexString();
  }
}

export async function eliminarProducto(id: string) {
    const { db } = await connectToDatabase();
    await db.collection('productos').deleteOne({ _id: new ObjectId(id) });
}

export async function cargaMasivaProductos(productos: (Omit<Producto, 'id'>)[]) {
   const { db } = await connectToDatabase();
   await db.collection('productos').insertMany(productos);
}


// --- Funciones de Empleados ---

export async function obtenerEmpleados() {
  const { db } = await connectToDatabase();
  const empleados = await db.collection('empleados').find({}).toArray();
  return JSON.parse(JSON.stringify(empleados)) as Empleado[];
}

export async function guardarEmpleado(empleado: Omit<Empleado, 'id'> & { id?: string }) {
  const { db } = await connectToDatabase();
  const { id, ...empleadoData } = empleado;

  if (id) {
    await db.collection('empleados').updateOne({ _id: new ObjectId(id) }, { $set: empleadoData });
    return id;
  } else {
    const result = await db.collection('empleados').insertOne(empleadoData);
    return result.insertedId.toHexString();
  }
}

export async function eliminarEmpleado(id: string) {
    const { db } = await connectToDatabase();
    await db.collection('empleados').deleteOne({ _id: new ObjectId(id) });
}


// --- Funciones de Clientes ---

export async function obtenerClientes() {
  const { db } = await connectToDatabase();
  const clientes = await db.collection('clientes').find({}).toArray();
  return JSON.parse(JSON.stringify(clientes)) as Cliente[];
}

export async function guardarCliente(cliente: Omit<Cliente, 'id'> & { id?: string }) {
  const { db } = await connectToDatabase();
  const { id, ...clienteData } = cliente;
  
  if (id) {
    await db.collection('clientes').updateOne({ _id: new ObjectId(id) }, { $set: clienteData });
    return id;
  } else {
    const result = await db.collection('clientes').insertOne(clienteData);
    return result.insertedId.toHexString();
  }
}

// --- Funciones de Ventas ---

export async function obtenerVentas() {
  const { db } = await connectToDatabase();
  const ventas = await db.collection('ventas').find({}).sort({ fecha: -1 }).toArray();
  return JSON.parse(JSON.stringify(ventas)) as Venta[];
}

export async function finalizarVenta(venta: Omit<Venta, 'id'>): Promise<string> {
    const { db } = await connectToDatabase();
    const session = (await connectToDatabase()).client.startSession();
    
    let ventaId;

    try {
        await session.withTransaction(async () => {
            // 1. Guardar la venta
            const result = await db.collection('ventas').insertOne(venta, { session });
            ventaId = result.insertedId;

            // 2. Actualizar el stock de los productos
            for (const item of venta.items) {
                const updateResult = await db.collection('productos').updateOne(
                    { _id: new ObjectId(item.productoId), "variantes.id": item.variante.id },
                    { $inc: { "variantes.$.cantidad": -item.cantidadEnCarrito } },
                    { session }
                );

                if (updateResult.matchedCount === 0) {
                    throw new Error(`No se pudo encontrar el producto con la variante: ${item.nombreProducto} (${item.variante.nombre})`);
                }
                 if (updateResult.modifiedCount === 0) {
                    // This could happen if another transaction modified the stock.
                    // We should check if the stock is still sufficient.
                    console.warn(`No se modificó el stock para ${item.nombreProducto}. Esto puede ser esperado si la cantidad no cambió.`);
                }
            }
        });
    } finally {
        await session.endSession();
    }
    
    if (!ventaId) {
        throw new Error("No se pudo completar la transacción de venta.");
    }
    
    return ventaId.toHexString();
}

export async function procesarDevolucion(ventaId: string): Promise<void> {
    const { db } = await connectToDatabase();
    const session = (await connectToDatabase()).client.startSession();

    try {
        await session.withTransaction(async () => {
            const ventaADevolver = await db.collection('ventas').findOne({ _id: new ObjectId(ventaId) });
            if (!ventaADevolver || ventaADevolver.estado === 'devuelta') {
                throw new Error("La venta no existe o ya ha sido devuelta.");
            }

            // 1. Actualizar el estado de la venta
            await db.collection('ventas').updateOne(
                { _id: new ObjectId(ventaId) },
                { $set: { estado: 'devuelta' } },
                { session }
            );

            // 2. Devolver los items al stock
            for (const item of ventaADevolver.items) {
                const updateResult = await db.collection('productos').updateOne(
                    { _id: new ObjectId(item.productoId), "variantes.id": item.variante.id },
                    { $inc: { "variantes.$.cantidad": item.cantidadEnCarrito } },
                    { session }
                );
                 if (updateResult.matchedCount === 0) {
                    throw new Error(`Producto a devolver no encontrado: ${item.nombreProducto}`);
                }
            }
        });
    } finally {
        await session.endSession();
    }
}


// --- Funciones de IA ---

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
