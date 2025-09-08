
"use client"

import * as React from "react"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"
import { User, Lock, Package2, Eye, EyeOff } from "lucide-react"

import { empleadosAtom, empleadoActivoAtom } from "@/lib/state"
import type { Empleado } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function LoginPage() {
  const [empleados] = useAtom(empleadosAtom)
  const [, setEmpleadoActivo] = useAtom(empleadoActivoAtom)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = React.useState<Empleado | null>(null)
  const [pin, setPin] = React.useState("")
  const [showPin, setShowPin] = React.useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSelectEmpleado = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado)
    setPin("")
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!empleadoSeleccionado) return

    if (empleadoSeleccionado.pin === pin) {
      setEmpleadoActivo(empleadoSeleccionado)
      toast({
        title: `Bienvenido, ${empleadoSeleccionado.nombre}`,
        description: "Has iniciado sesión correctamente.",
      })
      router.push("/")
    } else {
      toast({
        variant: "destructive",
        title: "PIN incorrecto",
        description: "El PIN que ingresaste no es válido. Inténtalo de nuevo.",
      })
      setPin("")
    }
  }

  const getInitiales = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center gap-2 mb-4">
              <Package2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline">Tienda Ágil</h1>
           </div>
          <CardTitle className="text-2xl">
            {empleadoSeleccionado ? `Hola, ${empleadoSeleccionado.nombre}` : "Selecciona tu usuario"}
          </CardTitle>
          <CardDescription>
             {empleadoSeleccionado ? "Por favor, ingresa tu PIN de 4 dígitos para continuar." : "Haz clic en tu perfil para iniciar sesión."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {empleadoSeleccionado ? (
            <div className="flex flex-col items-center gap-6">
                <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-3xl">{getInitiales(empleadoSeleccionado.nombre)}</AvatarFallback>
                </Avatar>
              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={4}
                    placeholder="PIN de 4 dígitos"
                    className="pl-10 text-center text-2xl tracking-[1em]"
                    autoFocus
                    required
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPin(!showPin)}
                   >
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                <Button type="submit" className="w-full">
                  Ingresar
                </Button>
              </form>
              <Button
                variant="link"
                onClick={() => setEmpleadoSeleccionado(null)}
              >
                Volver a la selección de usuario
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {empleados.map((empleado) => (
                <Card
                  key={empleado.id}
                  className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => handleSelectEmpleado(empleado)}
                >
                    <Avatar className="w-16 h-16 mb-2">
                         <AvatarFallback className="text-2xl">{getInitiales(empleado.nombre)}</AvatarFallback>
                    </Avatar>
                  <p className="font-semibold">{empleado.nombre}</p>
                  <p className="text-sm text-muted-foreground capitalize">{empleado.rol}</p>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
