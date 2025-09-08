
"use client"

import * as React from "react"
import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import type { Producto, Variante } from "@/lib/types"
import { PlusCircle, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const varianteSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  sku: z.string().min(3, { message: "El SKU debe tener al menos 3 caracteres." }),
  cantidad: z.coerce.number().int().nonnegative({ message: "La cantidad no puede ser negativa." }),
  precio: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
})

const productoSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  stockMinimo: z.coerce.number().int().nonnegative({ message: "El stock mínimo no puede ser negativo." }),
  variantes: z.array(varianteSchema).min(1, { message: "Debe haber al menos una variante." }),
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
      stockMinimo: 10,
      variantes: [],
    },
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variantes",
  });

  React.useEffect(() => {
    if (producto) {
      form.reset({
        nombre: producto.nombre,
        stockMinimo: producto.stockMinimo,
        variantes: producto.variantes,
      })
    } else {
      form.reset({
        nombre: "",
        stockMinimo: 10,
        variantes: [{ id: `var-${Date.now()}`, nombre: "Estándar", sku: "", cantidad: 0, precio: 0 }],
      })
    }
  }, [producto, open, form])

  function onSubmit(values: z.infer<typeof productoSchema>) {
    const productoAGuardar: Producto = {
      ...(producto || { 
        id: `prod-${Date.now()}`,
        ultimaModificacion: new Date().toISOString().split('T')[0],
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar Producto" : "Añadir Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {producto ? "Modifica los detalles del producto y sus variantes." : "Rellena los detalles del nuevo producto y sus variantes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Camiseta Logo" {...field} />
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
                    <FormLabel>Stock Mínimo Total</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Variantes</h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                       <FormField
                          control={form.control}
                          name={`variantes.${index}.nombre`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre Variante</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Rojo, Talla M" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`variantes.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: CAM-RO-M" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                       <FormField
                          control={form.control}
                          name={`variantes.${index}.cantidad`}
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
                          name={`variantes.${index}.precio`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Precio (COP)</FormLabel>
                              <FormControl>
                                <Input type="number" step="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ id: `var-${Date.now()}`, nombre: "", sku: "", cantidad: 0, precio: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Variante
                </Button>
                 <FormMessage>{form.formState.errors.variantes?.message}</FormMessage>
              </div>
            </div>

             <DialogFooter>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

    