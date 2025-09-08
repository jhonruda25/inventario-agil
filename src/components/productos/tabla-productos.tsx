
"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import type { Producto } from "@/lib/types"
import { DialogoProducto } from "./dialogo-producto"
import { DialogoSugerenciaIA } from "./dialogo-sugerencia-ia"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"


type TablaProductosProps = {
  productosIniciales: Producto[]
}

export function TablaProductos({ productosIniciales }: TablaProductosProps) {
  const [productos, setProductos] = React.useState<Producto[]>(productosIniciales)
  const [busqueda, setBusqueda] = React.useState("")
  const [dialogoAbierto, setDialogoAbierto] = React.useState(false)
  const [dialogoIAAbierto, setDialogoIAAbierto] = React.useState(false)
  const [productoSeleccionado, setProductoSeleccionado] =
    React.useState<Producto | null>(null)

  const productosFiltrados = React.useMemo(() => {
    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.variantes.some(v => v.sku.toLowerCase().includes(busqueda.toLowerCase()))
    )
  }, [productos, busqueda])

  const handleGuardarProducto = (productoEditado: Producto) => {
    setProductos((prev) => {
      const existe = prev.some((p) => p.id === productoEditado.id)
      if (existe) {
        return prev.map((p) =>
          p.id === productoEditado.id ? productoEditado : p
        )
      } else {
        return [...prev, productoEditado]
      }
    })
    setDialogoAbierto(false)
  }

  const handleAbrirDialogoNuevo = () => {
    setProductoSeleccionado(null)
    setDialogoAbierto(true)
  }

  const handleAbrirDialogoEditar = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setDialogoAbierto(true)
  }
  
  const handleAbrirDialogoIA = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setDialogoIAAbierto(true)
  }

  const handleEliminarProducto = (id: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== id))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
             <div className="relative flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre o SKU..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            <Button size="sm" className="gap-1" onClick={handleAbrirDialogoNuevo} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Añadir Producto
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"><span className="sr-only">Expandir</span></TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>SKUs</TableHead>
                <TableHead className="text-right">Stock Total</TableHead>
                <TableHead className="hidden md:table-cell text-right">Precio Promedio</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
              {productosFiltrados.map((producto) => {
                const stockTotal = producto.variantes.reduce((sum, v) => sum + v.cantidad, 0);
                const precioPromedio = producto.variantes.length > 0
                  ? producto.variantes.reduce((sum, v) => sum + v.precio, 0) / producto.variantes.length
                  : 0;

                return (
                <Collapsible asChild key={producto.id} tagName="tbody" className="border-b">
                    <>
                      <TableRow>
                        <TableCell>
                          {producto.variantes.length > 1 && (
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                              </Button>
                            </CollapsibleTrigger>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {producto.variantes.slice(0, 2).map(v => 
                              <Badge variant="outline" key={v.id}>{v.sku}</Badge>
                            )}
                            {producto.variantes.length > 2 && <Badge variant="secondary">...y {producto.variantes.length - 2} más</Badge>}
                          </div>
                        </TableCell>
                         <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                              <span>{stockTotal}</span>
                              {stockTotal === 0 ? (
                                  <Badge variant="destructive">Sin Stock</Badge>
                              ) : stockTotal <= producto.stockMinimo ? (
                                  <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80">Stock Bajo</Badge>
                              ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right">{formatCurrency(precioPromedio)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Alternar menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleAbrirDialogoIA(producto)}>Sugerencia IA</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAbrirDialogoEditar(producto)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleEliminarProducto(producto.id)}>Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                         <TableRow className="bg-muted/50">
                          <TableCell colSpan={6} className="p-0">
                             <div className="p-4">
                              <h4 className="font-semibold mb-2">Variantes</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Variante</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {producto.variantes.map(v => (
                                    <TableRow key={v.id}>
                                      <TableCell>{v.nombre}</TableCell>
                                      <TableCell><Badge variant="outline">{v.sku}</Badge></TableCell>
                                      <TableCell className="text-right">{v.cantidad}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(v.precio)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                             </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                </Collapsible>
              )})}
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{productos.length}</strong> productos.
          </div>
        </CardFooter>
      </Card>

      <DialogoProducto
        open={dialogoAbierto}
        onOpenChange={setDialogoAbierto}
        onSave={handleGuardarProducto}
        producto={productoSeleccionado}
      />
      
      {productoSeleccionado && (
         <DialogoSugerenciaIA
            open={dialogoIAAbierto}
            onOpenChange={setDialogoIAAbierto}
            producto={productoSeleccionado}
        />
      )}
    </>
  )
}
