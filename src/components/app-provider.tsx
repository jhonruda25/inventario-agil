
"use client"

import * as React from "react"
import { useAtom } from "jotai"
import { useRouter, usePathname } from "next/navigation"
import { empleadoActivoAtom } from "@/lib/state"

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [empleadoActivo] = useAtom(empleadoActivoAtom)
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    // Si no hay empleado activo y no estamos en la página de login, redirigir a login.
    if (!empleadoActivo && pathname !== '/login') {
      router.push('/login')
    }
    // Si hay un empleado activo y estamos en la página de login, redirigir al inicio.
    if (empleadoActivo && pathname === '/login') {
      router.push('/')
    }
  }, [empleadoActivo, pathname, router])

  // Mientras se redirige si no hay sesión, muestra un loader.
  if (!empleadoActivo && pathname !== '/login') {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirigiendo al login...</p>
        </div>
    );
  }
  
  // Mientras se redirige si ya hay sesión, muestra un loader.
  if (empleadoActivo && pathname === '/login') {
      return (
        <div className="flex h-screen items-center justify-center">
            <p>Ya has iniciado sesión. Redirigiendo...</p>
        </div>
    );
  }

  // Si todo está en orden, muestra la página solicitada.
  return <>{children}</>
}
