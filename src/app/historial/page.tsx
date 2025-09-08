
"use client"

import * as React from "react"
import Link from 'next/link'
import {
  CircleUser,
  Menu,
  Package,
  Package2,
  ShoppingCart,
  LineChart,
  Undo2,
  Users,
  UserCog,
  LogOut,
} from 'lucide-react'
import { useAtom } from 'jotai'
import { useRouter } from "next/navigation"

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ventasAtom, productosAtom, clientesAtom, empleadosAtom, empleadoActivoAtom } from "@/lib/state"
import type { Producto, Venta, Variante } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function HistorialPage() {
  const [ventas, setVentas] = useAtom(ventasAtom)
  const [clientes] = useAtom(clientesAtom)
  const [empleados] = useAtom(empleadosAtom)
  const [empleadoActivo, setEmpleadoActivo] = useAtom(empleadoActivoAtom)
  const [, setProductos] = useAtom(productosAtom)
  const router = useRouter()
  const { toast } = useToast()

  const handleDevolucion = (ventaId: string) => {
    const ventaADevolver = ventas.find(v => v.id === ventaId);
    if (!ventaADevolver || ventaADevolver.estado === 'devuelta') {
      toast({
        variant: "destructive",
        title: "Error en la devolución",
        description: "Esta venta ya ha sido devuelta o no se puede procesar.",
      });
      return;
    }

    // Actualizar el stock
    setProductos(prevProductos => {
      const productosActualizados = JSON.parse(JSON.stringify(prevProductos));
      ventaADevolver.items.forEach(itemDevuelto => {
        const productoIndex = productosActualizados.findIndex((p: Producto) => p.id === itemDevuelto.productoId);
        if (productoIndex !== -1) {
          const varianteIndex = productosActualizados[productoIndex].variantes.findIndex((v: Variante) => v.id === itemDevuelto.variante.id);
          if (varianteIndex !== -1) {
            productosActualizados[productoIndex].variantes[varianteIndex].cantidad += itemDevuelto.cantidadEnCarrito;
          }
        }
      });
      return productosActualizados;
    });

    // Actualizar el estado de la venta
    setVentas(prevVentas => 
      prevVentas.map(venta => 
        venta.id === ventaId ? { ...venta, estado: 'devuelta' } : venta
      )
    );

    toast({
      title: "Devolución Exitosa",
      description: `La venta ${ventaId} ha sido procesada y el stock ha sido restaurado.`,
    });
  }

  const handleLogout = () => {
    setEmpleadoActivo(null);
    router.push('/login');
  }

  const esAdmin = empleadoActivo?.rol === 'administrador';
  const esCajero = empleadoActivo?.rol === 'cajero';

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <Package2 className="h-6 w-6" />
              <span className="">Tienda Ágil</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {(esAdmin || esCajero) && (
              <Link
                href="/vender"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                Punto de Venta
              </Link>
              )}
              {(esAdmin || esCajero) && (
              <Link
                href="/historial"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Historial de Ventas
              </Link>
              )}
              {esAdmin && (
                <>
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Package className="h-4 w-4" />
                    Productos
                  </Link>
                  <Link
                    href="/clientes"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <Users className="h-4 w-4" />
                    Clientes
                  </Link>
                  <Link
                    href="/empleados"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <UserCog className="h-4 w-4" />
                    Empleados
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar menú de navegación</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold text-primary"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Tienda Ágil</span>
                </Link>
                {(esAdmin || esCajero) && (
                  <>
                    <Link
                      href="/vender"
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Punto de Venta
                    </Link>
                    <Link
                      href="/historial"
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                    >
                      <LineChart className="h-5 w-5" />
                      Historial de Ventas
                    </Link>
                  </>
                )}
                {esAdmin && (
                  <>
                    <Link
                      href="/"
                      className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <Package className="h-5 w-5" />
                      Productos
                    </Link>
                    <Link
                        href="/clientes"
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                        <Users className="h-5 w-5" />
                        Clientes
                    </Link>
                     <Link
                        href="/empleados"
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                        <UserCog className="h-5 w-5" />
                        Empleados
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Alternar menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{empleadoActivo?.nombre}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Historial de Ventas</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>
                Aquí puedes ver todas las ventas realizadas y gestionar devoluciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Venta</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Método Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.length > 0 ? (
                    ventas.map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell className="font-mono text-xs">{venta.id}</TableCell>
                        <TableCell>{new Date(venta.fecha).toLocaleString('es-CO')}</TableCell>
                        <TableCell>{clientes.find(c => c.id === venta.clienteId)?.nombre || 'N/A'}</TableCell>
                        <TableCell>{empleados.find(e => e.id === venta.empleadoId)?.nombre || 'N/A'}</TableCell>
                        <TableCell>
                           <ul className="list-disc list-inside text-xs">
                            {venta.items.map(item => (
                                <li key={item.variante.id}>
                                    {item.cantidadEnCarrito}x {item.nombreProducto} ({item.variante.nombre})
                                </li>
                            ))}
                           </ul>
                        </TableCell>
                         <TableCell>
                            <Badge variant="outline" className="capitalize">{venta.metodoPago}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={venta.estado === 'devuelta' ? 'destructive' : 'secondary'} className="capitalize">{venta.estado}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {venta.descuento && (
                              <div className="text-xs text-destructive line-through">{formatCurrency(venta.subtotal)}</div>
                          )}
                          {formatCurrency(venta.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDevolucion(venta.id)}
                            disabled={venta.estado === 'devuelta'}
                          >
                            <Undo2 className="mr-2 h-3 w-3" />
                            Devolución
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-24 text-center"
                      >
                        No hay ventas registradas aún.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>{ventas.length}</strong> venta(s).
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  )
}
