import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { productos as productosIniciales, clientes as clientesIniciales, empleados as empleadosIniciales } from '@/lib/data';
import { Product, Client, Employee } from '@/lib/types';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Clear existing collections
    await db.collection('productos').deleteMany({});
    await db.collection('clientes').deleteMany({});
    await db.collection('empleados').deleteMany({});
    await db.collection('ventas').deleteMany({});

    // Insert initial data
    await db.collection<Omit<Product, '_id'>>('productos').insertMany(productosIniciales);
    await db.collection<Omit<Client, '_id'>>('clientes').insertMany(clientesIniciales);
    await db.collection<Omit<Employee, '_id'>>('empleados').insertMany(empleadosIniciales);

    return NextResponse.json({ message: 'Database seeded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ message: 'Failed to seed database', error: (error as Error).message }, { status: 500 });
  }
}
