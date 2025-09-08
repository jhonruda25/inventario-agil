
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { productos as productosIniciales, clientes as clientesIniciales, empleados as empleadosIniciales } from '@/lib/data';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Clear existing collections
    await db.collection('productos').deleteMany({});
    await db.collection('clientes').deleteMany({});
    await db.collection('empleados').deleteMany({});
    await db.collection('ventas').deleteMany({});

    // Insert initial data
    await db.collection('productos').insertMany(productosIniciales as any[]);
    await db.collection('clientes').insertMany(clientesIniciales as any[]);
    await db.collection('empleados').insertMany(empleadosIniciales as any[]);

    return NextResponse.json({ message: 'Database seeded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ message: 'Failed to seed database', error: (error as Error).message }, { status: 500 });
  }
}
