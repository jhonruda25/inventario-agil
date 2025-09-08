
"use client"

import * as React from "react"
import { useAtom } from "jotai"
import { useRouter, usePathname } from "next/navigation"
import { empleadoActivoAtom } from "@/lib/state"
import type { RolEmpleado } from "@/lib/types"

const rutasPermitidas: Record<RolEmpleado, string[]> = {
    administrador: ['/', '/vender', '/historial', '/clientes', '/empleados'],
    cajero: ['/vender', '/historial', '/clientes'],
    inventario: ['/']
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
            
            // Caso especial: La ruta '/' es para productos, solo para admin e inventario.
            if (pathname === '/' && rol === 'cajero') {
                 router.push('/vender');
                 return;
            }

            if (!paginaPermitida) {
                // Si no tiene permiso, lo redirigimos a su "home" por defecto.
                if (rol === 'cajero') router.push('/vender');
                else router.push('/');
            }
        }
    }
  }, [empleadoActivo, pathname, router])


  if (!empleadoActivo && pathname !== '/login') {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirigiendo al login...</p>
        </div>
    );
  }
  
  if (empleadoActivo && pathname === '/login') {
      return (
        <div className="flex h-screen items-center justify-center">
            <p>Ya has iniciado sesión. Redirigiendo...</p>
        </div>
    );
  }

  // Si el empleado está cargado pero no tiene permisos para la ruta actual, mostramos un loader mientras redirige
  if (empleadoActivo && !rutasPermitidas[empleadoActivo.rol]?.includes(pathname)) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>No tienes permiso para acceder a esta página. Redirigiendo...</p>
        </div>
    );
  }


  return <>{children}</>
}
