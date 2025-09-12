
'use server';

import { z } from 'zod';
import { Product, Sale, Client, Employee, Venta, Producto, Variante } from '@/lib/types';
import { connectToDatabase } from '@/lib/mongodb';
import {
  insertProduct,
  updateProduct,
  deleteProduct,
  insertClient,
  updateClient,
  deleteClient,
  insertEmployee,
  updateEmployee,
  deleteEmployee,
  insertSale,
  findProducts,
  findClients,
  findEmployees,
  findVentas,
  findVentaById,
  updateVenta,
  findProductById,
  insertManyProducts,
} from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { sugerirReposicionStock as runSugerenciaReposicionStock, SugerirReposicionStockInput, SugerirReposicionStockOutput } from '@/ai/flows/sugerencia-reposicion-stock';
import { ObjectId } from 'mongodb';


// Esquemas de validación...
const ProductSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  stockMinimo: z.coerce.number().int().nonnegative('El stock mínimo no puede ser negativo'),
  variantes: z.array(z.any()), // Simplificado por ahora
});

const CreateProduct = ProductSchema.omit({ id: true });
const UpdateProduct = ProductSchema;

const ClientSchema = z.object({
    id: z.string(),
    nombre: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email no válido'),
    telefono: z.string().optional(),
});

const CreateClient = ClientSchema.omit({ id: true });
const UpdateClient = ClientSchema;

const EmployeeSchema = z.object({
    id: z.string(),
    nombre: z.string().min(1, 'El nombre es requerido'),
    rol: z.enum(['administrador', 'cajero', 'inventario']),
    pin: z.string().length(4, 'El PIN debe tener 4 dígitos'),
});

const CreateEmployee = EmployeeSchema.omit({ id: true });
const UpdateEmployee = EmployeeSchema;


// --- OBTENER DATOS ---

export async function obtenerProductos(): Promise<Producto[]> {
  return await findProducts();
}

export async function obtenerClientes(): Promise<Cliente[]> {
    return await findClients();
}

export async function obtenerEmpleados(): Promise<Empleado[]> {
    return await findEmployees();
}

export async function obtenerVentas(): Promise<Venta[]> {
    return await findVentas();
}


// --- Acciones de Productos ---

export async function guardarProducto(producto: Omit<Producto, 'id' | '_id'> & { id?: string }) {
    if (producto.id) {
        const id = producto.id;
        delete producto.id;
        const productoToUpdate: Partial<Producto> = producto;
        await updateProduct(id, productoToUpdate);
        revalidatePath('/');
        return id;

    } else {
        const newProduct: Omit<Producto, '_id' | 'id'> = producto;
        const result = await insertProduct(newProduct);
        revalidatePath('/');
        return result.insertedId.toString();
    }
}

export async function eliminarProducto(id: string) {
    try {
        await deleteProduct(id);
        revalidatePath('/');
        return { message: 'Producto eliminado.' };
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo eliminar el producto.' };
    }
}

export async function cargaMasivaProductos(productos: Omit<Producto, 'id' | '_id'>[]) {
    try {
        await insertManyProducts(productos);
        revalidatePath('/');
    } catch(error) {
        console.error("Error en cargaMasivaProductos action:", error);
        throw new Error('Error de base de datos: No se pudieron insertar los productos.');
    }
}


// --- Acciones de Clientes ---

export async function guardarCliente(cliente: Omit<Cliente, 'id' | '_id'> & { id?: string }) {
    if (cliente.id) {
        const id = cliente.id;
        delete cliente.id;
        const clientToUpdate: Partial<Client> = cliente;
        await updateClient(id, clientToUpdate);
        revalidatePath('/clientes');
        return id;

    } else {
        const newClient: Omit<Client, '_id' | 'id'> = cliente;
        const result = await insertClient(newClient);
        revalidatePath('/clientes');
        return result.insertedId.toString();
    }
}


export async function eliminarCliente(id: string) {
    try {
        await deleteClient(id);
        revalidatePath('/clientes');
        return { message: 'Cliente eliminado.' };
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo eliminar el cliente.' };
    }
}

// --- Acciones de Empleados ---

export async function guardarEmpleado(empleado: Omit<Employee, 'id' | '_id'> & { id?: string }) {
    if (empleado.id) {
        const id = empleado.id;
        delete empleado.id;
        const employeeToUpdate: Partial<Employee> = empleado;
        await updateEmployee(id, employeeToUpdate);
        revalidatePath('/empleados');
        return id;
    } else {
        const newEmployee: Omit<Employee, '_id' | 'id'> = empleado;
        const result = await insertEmployee(newEmployee);
        revalidatePath('/empleados');
        return result.insertedId.toString();
    }
}

export async function eliminarEmpleado(id: string) {
    try {
        await deleteEmployee(id);
        revalidatePath('/empleados');
        return { message: 'Empleado eliminado.' };
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo eliminar el empleado.' };
    }
}

// --- Acciones de Ventas ---

export async function finalizarVenta(venta: Omit<Venta, 'id' | '_id'>) {
    try {
        const { db } = await connectToDatabase();
        
        // 1. Insertar la venta
        const result = await insertSale(venta);
        const ventaId = result.insertedId.toString();

        // 2. Actualizar el stock de cada producto vendido
        const bulkOps = venta.items.map(item => {
            return {
                updateOne: {
                    filter: { 
                        _id: new ObjectId(item.productoId), 
                        'variantes.id': item.variante.id 
                    },
                    update: { 
                        $inc: { 'variantes.$.cantidad': -item.cantidadEnCarrito } 
                    }
                }
            };
        });

        if (bulkOps.length > 0) {
            await db.collection('productos').bulkWrite(bulkOps);
        }

        revalidatePath('/');
        revalidatePath('/historial');
        
        return ventaId;
    } catch (error) {
        console.error("Error al finalizar la venta:", error);
        throw new Error('Error de base de datos: No se pudo registrar la venta.');
    }
}


export async function procesarDevolucion(ventaId: string) {
    try {
        const { db } = await connectToDatabase();
        const venta = await findVentaById(ventaId);

        if (!venta || venta.estado === 'devuelta') {
            throw new Error('La venta no existe o ya fue devuelta.');
        }

        // 1. Restaurar el stock
        const bulkOps = venta.items.map(item => ({
            updateOne: {
                filter: { _id: new ObjectId(item.productoId), 'variantes.id': item.variante.id },
                update: { $inc: { 'variantes.$.cantidad': item.cantidadEnCarrito } }
            }
        }));

        if (bulkOps.length > 0) {
            await db.collection('productos').bulkWrite(bulkOps);
        }

        // 2. Actualizar el estado de la venta a 'devuelta'
        await updateVenta(ventaId, { estado: 'devuelta' });

        revalidatePath('/');
        revalidatePath('/historial');
        return { success: true };

    } catch (error) {
        console.error("Error al procesar la devolución:", error);
        throw new Error('Error de base de datos: No se pudo procesar la devolución.');
    }
}


export async function obtenerSugerenciaReposicion(input: SugerirReposicionStockInput): Promise<SugerirReposicionStockOutput> {
    try {
      const sugerencia = await runSugerenciaReposicionStock(input);
      return sugerencia;
    } catch (error: unknown) {
      console.error('Error al obtener sugerencia de stock:', error);
      if (error instanceof Error) {
        throw new Error(`Error al generar la sugerencia: ${error.message}`);
      }
      throw new Error('Error al generar la sugerencia: Ocurrió un error desconocido.');
    }
}
