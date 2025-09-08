
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
import type { Cliente } from "@/lib/types"

const clienteSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  telefono: z.string().min(7, { message: "El teléfono debe tener al menos 7 dígitos." }),
})

type DialogoClienteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (cliente: Omit<Cliente, 'id'>) => void
  cliente: Cliente | null
}

export function DialogoCliente({ open, onOpenChange, onSave, cliente }: DialogoClienteProps) {
  const form = useForm<z.infer<typeof clienteSchema>>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
    },
  })

  React.useEffect(() => {
    if (cliente) {
      form.reset({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
      })
    } else {
      form.reset({
        nombre: "",
        email: "",
        telefono: "",
      })
    }
  }, [cliente, open, form])

  function onSubmit(values: z.infer<typeof clienteSchema>) {
     onSave({ ...values, historialVentasIds: [], puntos: 0 });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Añadir Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {cliente ? "Modifica los datos del cliente." : "Rellena los datos del nuevo cliente."}
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
                    <Input placeholder="Ej: Ana Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ej: ana.perez@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 3001234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="submit">Guardar Cliente</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
