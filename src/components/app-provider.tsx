
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
    if (!empleadoActivo && pathname !== '/login') {
      router.push('/login')
    }
  }, [empleadoActivo, pathname, router])

  if (!empleadoActivo && pathname !== '/login') {
    // Puedes mostrar un loader aquí mientras redirige
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirigiendo al login...</p>
        </div>
    );
  }
  
  if (empleadoActivo && pathname === '/login') {
      router.push('/');
      return (
        <div className="flex h-screen items-center justify-center">
            <p>Ya has iniciado sesión. Redirigiendo...</p>
        </div>
    );
  }

  return <>{children}</>
}
