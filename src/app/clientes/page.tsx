
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
  Users,
  MoreHorizontal,
  PlusCircle,
  UserCog,
  LogOut,
  Trash2
} from 'lucide-react'
import { useAtom } from 'jotai'
import { useRouter } from "next/navigation"

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

import { clientesAtom, ventasAtom, empleadoActivoAtom } from "@/lib/state"
import type { Cliente } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { DialogoCliente } from "@/components/clientes/dialogo-cliente"
import { guardarCliente, eliminarCliente as eliminarClienteAction } from "@/app/actions"


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ClientesPage() {
  const [clientes, setClientes] = useAtom(clientesAtom)
  const [ventas] = useAtom(ventasAtom)
  const [empleadoActivo, setEmpleadoActivo] = useAtom(empleadoActivoAtom)
  const router = useRouter()
  const { toast } = useToast()

  const [dialogoAbierto, setDialogoAbierto] = React.useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = React.useState<Cliente | null>(null)

  const handleGuardarCliente = async (cliente: Omit<Cliente, 'id'>) => {
    try {
      const id = clienteSeleccionado?.id;
      const clienteConId = { ...cliente, id };
      const clienteId = await guardarCliente(clienteConId);
      
      const clienteGuardado = {
        ...cliente,
        id: clienteId,
        _id: clienteId
      }

      setClientes((prev) => {
        const existe = prev.some((c) => c.id === clienteId);
        if (existe) {
          return prev.map((c) =>
            c.id === clienteId ? clienteGuardado : c
          )
        } else {
          return [...prev, clienteGuardado]
        }
      })
      toast({
          title: `Cliente ${id ? 'actualizado' : 'creado'}`,
          description: `El cliente ${cliente.nombre} ha sido guardado correctamente.`
      })
      setDialogoAbierto(false)
      setClienteSeleccionado(null)
    } catch(error) {
       toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'No se pudo guardar el cliente.'
      })
    }
  }
  
  const handleEliminarCliente = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar a este cliente? Esta acción no se puede deshacer.')) return;
    
    try {
      await eliminarClienteAction(id);
      setClientes(prev => prev.filter(c => c.id !== id));
       toast({
        variant: 'destructive',
        title: 'Cliente eliminado',
        description: 'El cliente ha sido eliminado de la base de datos.'
      })
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error al eliminar',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el cliente.'
      })
    }
  }


  const handleAbrirDialogoNuevo = () => {
    setClienteSeleccionado(null)
    setDialogoAbierto(true)
  }

  const handleAbrirDialogoEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setDialogoAbierto(true)
  }

  const getEstadisticasCliente = (clienteId: string) => {
    const ventasCliente = ventas.filter(v => v.clienteId === clienteId);
    const gastoTotal = ventasCliente.reduce((acc, v) => acc + v.total, 0);
    const ultimaCompra = ventasCliente.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0]?.fecha;
    return {
        numCompras: ventasCliente.length,
        gastoTotal,
        ultimaCompra: ultimaCompra ? ultimaCompra.toLocaleDateString('es-CO') : 'N/A'
    }
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
                <>
                    <Link
                        href="/vender"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Punto de Venta
                    </Link>
                    <Link
                        href="/historial"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <LineChart className="h-4 w-4" />
                        Historial de Ventas
                    </Link>
                    <Link
                        href="/clientes"
                        className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                    >
                        <Users className="h-4 w-4" />
                        Clientes
                    </Link>
                </>
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
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                        <LineChart className="h-5 w-5" />
                        Historial de Ventas
                        </Link>
                        <Link
                            href="/clientes"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                        >
                            <Users className="h-5 w-5" />
                            Clientes
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
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Gestión de Clientes</h1>
             <Button size="sm" className="gap-1" onClick={handleAbrirDialogoNuevo} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Añadir Cliente
                </span>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Administra la información de tus clientes y su historial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead>Gasto Total</TableHead>
                    <TableHead>Última Compra</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.length > 0 ? (
                    clientes.map((cliente) => {
                      const stats = getEstadisticasCliente(cliente.id!)
                      return (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nombre}</TableCell>
                        <TableCell>
                          <div className="text-sm">{cliente.email}</div>
                          <div className="text-xs text-muted-foreground">{cliente.telefono}</div>
                        </TableCell>
                        <TableCell>{stats.numCompras}</TableCell>
                        <TableCell>{formatCurrency(stats.gastoTotal)}</TableCell>
                        <TableCell>{stats.ultimaCompra}</TableCell>
                        <TableCell className="text-right">
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
                              <DropdownMenuItem onClick={() => handleAbrirDialogoEditar(cliente)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem disabled>Ver Compras</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleEliminarCliente(cliente.id!)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )})
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center"
                      >
                        No hay clientes registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>{clientes.length}</strong> cliente(s).
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>

       <DialogoCliente
        open={dialogoAbierto}
        onOpenChange={setDialogoAbierto}
        onSave={handleGuardarCliente}
        cliente={clienteSeleccionado}
      />
    </div>
  )
}
