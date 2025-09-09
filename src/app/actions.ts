'use server';

import { z } from 'zod';
import { Product, Sale, Client, Employee } from './lib/types';
import {
  fetchProducts,
  fetchProductById,
  insertProduct,
  updateProduct,
  deleteProduct,
  fetchClients,
  fetchClientById,
  insertClient,
  updateClient,
  deleteClient,
  fetchEmployees,
  fetchEmployeeById,
  insertEmployee,
  updateEmployee,
  deleteEmployee,
  fetchSales,
  insertSale,
} from './lib/data';
import { revalidatePath } from 'next/cache';
import { runSugerenciaReposicionStock } from '@/ai/flows/sugerencia-reposicion-stock';

// Esquemas de validación...
const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
  price: z.coerce.number().gt(0, 'El precio debe ser mayor a 0'),
  stock: z.coerce.number().int().nonnegative('El stock no puede ser negativo'),
  category: z.string().optional(),
  code: z.string().min(1, 'El código es requerido'),
};

const CreateProduct = ProductSchema.omit({ id: true });
const UpdateProduct = ProductSchema;

const ClientSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email no válido'),
    phone: z.string().optional(),
    document: z.string().min(1, 'El documento es requerido')
});

const CreateClient = ClientSchema.omit({ id: true });
const UpdateClient = ClientSchema;

const EmployeeSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email no válido'),
    phone: z.string().optional(),
    position: z.string().min(1, 'La posición es requerida')
});

const CreateEmployee = EmployeeSchema.omit({ id: true });
const UpdateEmployee = EmployeeSchema;

// --- Acciones de Productos ---

export async function crearProducto(formData: FormData) {
  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    price: formData.get('price'),
    stock: formData.get('stock'),
    category: formData.get('category'),
    code: formData.get('code'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación. No se pudo crear el producto.',
    };
  }

  try {
    const newProduct: Omit<Product, '_id'> = {
      name: validatedFields.data.name,
      price: validatedFields.data.price,
      stock: validatedFields.data.stock,
      category: validatedFields.data.category || '',
      code: validatedFields.data.code,
    };
    await insertProduct(newProduct);
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo crear el producto.' };
  }

  revalidatePath('/');
  return { message: 'Producto creado exitosamente.' };
}

export async function editarProducto(id: string, formData: FormData) {
    const validatedFields = UpdateProduct.safeParse({
        id: id,
        name: formData.get('name'),
        price: formData.get('price'),
        stock: formData.get('stock'),
        category: formData.get('category'),
        code: formData.get('code'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error de validación. No se pudo actualizar el producto.',
        };
    }

    try {
        const productToUpdate: Product = {
            _id: validatedFields.data.id,
            name: validatedFields.data.name,
            price: validatedFields.data.price,
            stock: validatedFields.data.stock,
            category: validatedFields.data.category || '',
            code: validatedFields.data.code,
        };
        await updateProduct(productToUpdate);
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo actualizar el producto.' };
    }

    revalidatePath('/');
    return { message: 'Producto actualizado exitosamente.' };
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

// --- Acciones de Clientes ---

export async function crearCliente(formData: FormData) {
    const validatedFields = CreateClient.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        document: formData.get('document'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error de validación. No se pudo crear el cliente.',
        };
    }

    try {
        const newClient: Omit<Client, '_id'> = { ...validatedFields.data };
        await insertClient(newClient);
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo crear el cliente.' };
    }

    revalidatePath('/clientes');
    return { message: 'Cliente creado exitosamente.' };
}

export async function editarCliente(id: string, formData: FormData) {
    const validatedFields = UpdateClient.safeParse({
        id: id,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        document: formData.get('document'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error de validación. No se pudo actualizar el cliente.',
        };
    }
    
    try {
        const clientToUpdate: Client = { _id: id, ...validatedFields.data };
        await updateClient(clientToUpdate);
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo actualizar el cliente.' };
    }

    revalidatePath('/clientes');
    return { message: 'Cliente actualizado exitosamente.' };
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

export async function crearEmpleado(formData: FormData) {
    const validatedFields = CreateEmployee.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        position: formData.get('position'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error de validación. No se pudo crear el empleado.',
        };
    }

    try {
        const newEmployee: Omit<Employee, '_id'> = { ...validatedFields.data };
        await insertEmployee(newEmployee);
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo crear el empleado.' };
    }

    revalidatePath('/empleados');
    return { message: 'Empleado creado exitosamente.' };
}

export async function editarEmpleado(id: string, formData: FormData) {
    const validatedFields = UpdateEmployee.safeParse({
        id: id,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        position: formData.get('position'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error de validación. No se pudo actualizar el empleado.',
        };
    }
    
    try {
        const employeeToUpdate: Employee = { _id: id, ...validatedFields.data };
        await updateEmployee(employeeToUpdate);
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo actualizar el empleado.' };
    }

    revalidatePath('/empleados');
    return { message: 'Empleado actualizado exitosamente.' };
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

export async function crearVenta(sale: Omit<Sale, '_id'>) {
    try {
        await insertSale(sale);
        // Revalidar los productos para reflejar el nuevo stock
        revalidatePath('/');
        // Revalidar el historial de ventas
        revalidatePath('/historial');
        return { success: true, message: 'Venta registrada exitosamente.' };
    } catch (error) {
        return { success: false, message: 'Error de base de datos: No se pudo registrar la venta.' };
    }
}


export async function obtenerSugerenciaDeStock() {
    try {
      const sugerencia = await runSugerenciaReposicionStock();
      return sugerencia;
    } catch (error: any) {
      console.error('Error al obtener sugerencia de stock:', error);
      return `Error al generar la sugerencia: ${error.message}`;
    }
  }
