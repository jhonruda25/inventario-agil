
"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Empleado } from "@/lib/types"

const empleadoSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  rol: z.enum(['administrador', 'cajero', 'inventario'], { required_error: "Debes seleccionar un rol." }),
  pin: z.string().length(4, { message: "El PIN debe tener exactamente 4 dígitos." }).regex(/^\d+$/, { message: "El PIN solo puede contener números." }),
})

type DialogoEmpleadoProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (empleado: Empleado) => void
  empleado: Empleado | null
}

export function DialogoEmpleado({ open, onOpenChange, onSave, empleado }: DialogoEmpleadoProps) {
  const form = useForm<z.infer<typeof empleadoSchema>>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: {
      nombre: "",
      rol: "cajero",
      pin: "",
    },
  })

  React.useEffect(() => {
    if (empleado) {
      form.reset({
        nombre: empleado.nombre,
        rol: empleado.rol,
        pin: empleado.pin,
      })
    } else {
      form.reset({
        nombre: "",
        rol: "cajero",
        pin: "",
      })
    }
  }, [empleado, open, form])

  function onSubmit(values: z.infer<typeof empleadoSchema>) {
    const empleadoAGuardar: Empleado = {
      id: empleado?.id || `emp-${Date.now()}`,
      ...values,
    };
    onSave(empleadoAGuardar)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{empleado ? "Editar Empleado" : "Añadir Nuevo Empleado"}</DialogTitle>
          <DialogDescription>
            {empleado ? "Modifica los datos del empleado." : "Rellena los datos del nuevo empleado."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="rol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="cajero">Cajero</SelectItem>
                      <SelectItem value="inventario">Encargado de Inventario</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN de 4 dígitos</FormLabel>
                  <FormControl>
                    <Input type="password" maxLength={4} placeholder="Ej: 1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="submit">Guardar Empleado</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
