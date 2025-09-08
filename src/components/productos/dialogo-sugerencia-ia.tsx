"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bot, Loader2 } from "lucide-react"

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import type { Producto } from "@/lib/types"
import type { SugerirReposicionStockOutput } from "@/ai/flows/sugerencia-reposicion-stock"
import { obtenerSugerenciaReposicion } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

const sugerenciaSchema = z.object({
  leadTime: z.coerce.number().int().positive({ message: "El lead time debe ser un número positivo." }),
  tasaVentaDiaria: z.coerce.number().positive({ message: "La tasa de venta debe ser un número positivo." }),
})

type DialogoSugerenciaIAProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto
}

export function DialogoSugerenciaIA({ open, onOpenChange, producto }: DialogoSugerenciaIAProps) {
  const [sugerencia, setSugerencia] = React.useState<SugerirReposicionStockOutput | null>(null)
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()
  
  const stockTotal = producto.variantes.reduce((sum, v) => sum + v.cantidad, 0);

  const form = useForm<z.infer<typeof sugerenciaSchema>>({
    resolver: zodResolver(sugerenciaSchema),
    defaultValues: {
      leadTime: producto.leadTime || 7,
      tasaVentaDiaria: producto.tasaVentaDiaria || 1,
    },
  })

  React.useEffect(() => {
    if (open) {
      setSugerencia(null)
      setLoading(false)
      form.reset({
        leadTime: producto.leadTime || 7,
        tasaVentaDiaria: producto.tasaVentaDiaria || 1,
      })
    }
  }, [open, producto, form])

  async function onSubmit(values: z.infer<typeof sugerenciaSchema>) {
    setLoading(true)
    setSugerencia(null)
    try {
      const resultado = await obtenerSugerenciaReposicion({
        ...values,
        stockActual: stockTotal,
        historialVentas: JSON.stringify(producto.historialVentas),
      })
      setSugerencia(resultado)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: error instanceof Error ? error.message : "Ocurrió un error desconocido.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sugerencia de Reposición con IA</DialogTitle>
          <DialogDescription>
            Analiza el stock de <strong>{producto.nombre}</strong> (Actual: {stockTotal} uds.) para obtener una recomendación de compra.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leadTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Time (días)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tasaVentaDiaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venta Diaria (uds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Generar Sugerencia
                  </>
                )}
              </Button>
            </form>
          </Form>

          {sugerencia && (
            <Alert className="mt-4" style={{borderColor: 'hsl(var(--accent))'}}>
              <Bot className="h-4 w-4" style={{color: 'hsl(var(--accent))'}} />
              <AlertTitle style={{color: 'hsl(var(--accent))'}}>Recomendación de la IA</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Cantidad recomendada a reponer: <strong className="text-lg">{sugerencia.cantidadRecomendada} unidades</strong>.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  <strong>Razonamiento:</strong> {sugerencia.razonamiento}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
           <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
