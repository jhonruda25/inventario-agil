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
import type { Producto } from "@/lib/types"

const productoSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  sku: z.string().min(3, { message: "El SKU debe tener al menos 3 caracteres." }),
  cantidad: z.coerce.number().int().nonnegative({ message: "La cantidad no puede ser negativa." }),
  stockMinimo: z.coerce.number().int().nonnegative({ message: "El stock mínimo no puede ser negativo." }),
  precio: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
})

type DialogoProductoProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (producto: Producto) => void
  producto: Producto | null
}

export function DialogoProducto({ open, onOpenChange, onSave, producto }: DialogoProductoProps) {
  const form = useForm<z.infer<typeof productoSchema>>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: "",
      sku: "",
      cantidad: 0,
      stockMinimo: 10,
      precio: 0,
    },
  })

  React.useEffect(() => {
    if (producto) {
      form.reset(producto)
    } else {
      form.reset({
        nombre: "",
        sku: "",
        cantidad: 0,
        stockMinimo: 10,
        precio: 0,
      })
    }
  }, [producto, open, form])

  function onSubmit(values: z.infer<typeof productoSchema>) {
    const productoAGuardar: Producto = {
      ...(producto || { 
        id: `prod-${Date.now()}`,
        ultimaModificacion: new Date().toISOString().split('T')[0],
        // Default values for new products for AI features
        historialVentas: [],
        tasaVentaDiaria: 0,
        leadTime: 7,
       }),
      ...values,
    };
    onSave(productoAGuardar)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar Producto" : "Añadir Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {producto ? "Modifica los detalles del producto." : "Rellena los detalles del nuevo producto."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Laptop Pro 15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: LP-15-512" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="precio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
