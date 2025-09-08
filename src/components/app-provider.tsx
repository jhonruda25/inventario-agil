
"use client"

import * as React from "react"
import { useAtom, useSetAtom } from "jotai"
import { useRouter, usePathname } from "next/navigation"
import { empleadoActivoAtom, productosAtom, clientesAtom, empleadosAtom, ventasAtom } from "@/lib/state"
import type { RolEmpleado, Producto, Cliente, Empleado, Venta } from "@/lib/types"
import { obtenerProductos, obtenerClientes, obtenerEmpleados, obtenerVentas } from "@/app/actions"

const rutasPermitidas: Record<RolEmpleado, string[]> = {
    administrador: ['/', '/vender', '/historial', '/clientes', '/empleados'],
    cajero: ['/vender', '/historial', '/clientes'],
    inventario: ['/']
}

function DataProvider({ children }: { children: React.ReactNode }) {
  const setProductos = useSetAtom(productosAtom);
  const setClientes = useSetAtom(clientesAtom);
  const setEmpleados = useSetAtom(empleadosAtom);
  const setVentas = useSetAtom(ventasAtom);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [productosData, clientesData, empleadosData, ventasData] = await Promise.all([
          obtenerProductos(),
          obtenerClientes(),
          obtenerEmpleados(),
          obtenerVentas(),
        ]);
        setProductos(productosData);
        setClientes(clientesData);
        setEmpleados(empleadosData);
        setVentas(ventasData.map(v => ({...v, fecha: new Date(v.fecha)}))); // Convertir string a Date
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        // Aquí podrías mostrar un toast de error
      } finally {
        setDataLoaded(true);
      }
    }
    fetchData();
  }, [setProductos, setClientes, setEmpleados, setVentas]);

  if (!dataLoaded) {
    return (
       <div className="flex h-screen items-center justify-center">
            <p>Cargando datos de la tienda...</p>
        </div>
    )
  }

  return <>{children}</>;
}


export function AppProvider({ children }: { children: React.ReactNode }) {
  const [empleadoActivo] = useAtom(empleadoActivoAtom)
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!empleadoActivo && pathname !== '/login') {
      router.push('/login')
    } else if (empleadoActivo) {
        if (pathname === '/login') {
            router.push('/')
        } else {
            const rol = empleadoActivo.rol;
            const paginaPermitida = rutasPermitidas[rol]?.includes(pathname);
            
            if (pathname === '/' && rol === 'cajero') {
                 router.push('/vender');
                 return;
            }

            if (!paginaPermitida) {
                if (rol === 'cajero') router.push('/vender');
                else router.push('/');
            }
        }
    }
  }, [empleadoActivo, pathname, router])


  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!empleadoActivo) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirigiendo al login...</p>
        </div>
    );
  }

  return <DataProvider>{children}</DataProvider>;
}