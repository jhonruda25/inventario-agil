
"use client";

import * as React from "react";
import {
  CircleUser,
  Menu,
  Package2,
  ScanLine,
  Search,
  ShoppingCart,
  Package,
  VideoOff,
  X,
  ChevronDown,
  Printer,
  LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

import type { Producto, Variante, Venta, CarritoItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAtom } from 'jotai'
import { ventasAtom, productosAtom } from "@/lib/state";

export default function VenderPage() {
  const [productos, setProductos] = useAtom(productosAtom);
  const [carrito, setCarrito] = React.useState<CarritoItem[]>([]);
  const [busqueda, setBusqueda] = React.useState("");
  const [montoPagado, setMontoPagado] = React.useState<string>("");
  const [cambio, setCambio] = React.useState<number | null>(null);
  const [metodoPago, setMetodoPago] = React.useState("efectivo");
  const { toast } = useToast();
  
  const [dialogoVariantesAbierto, setDialogoVariantesAbierto] = React.useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = React.useState<Producto | null>(null);
  const [ventaFinalizada, setVentaFinalizada] = React.useState<Venta | null>(null);
  const [dialogoTicketAbierto, setDialogoTicketAbierto] = React.useState(false);
  
  const [, setVentas] = useAtom(ventasAtom);


  // --- Estados para el escáner ---
  const [isScanning, setIsScanning] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const totalCarrito = React.useMemo(() => {
    return carrito.reduce((total, item) => total + item.variante.precio * item.cantidadEnCarrito, 0);
  }, [carrito]);

  const productosFiltrados = React.useMemo(() => {
    if (!busqueda) return [];
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.variantes.some(v => v.sku.toLowerCase().includes(busqueda.toLowerCase()))
    );
  }, [productos, busqueda]);

  const handleSeleccionProducto = (producto: Producto) => {
    if (producto.variantes.length === 1) {
      agregarAlCarrito(producto, producto.variantes[0]);
    } else {
      setProductoSeleccionado(producto);
      setDialogoVariantesAbierto(true);
    }
  }
  
  const agregarAlCarrito = React.useCallback((producto: Producto, variante: Variante) => {
    setCarrito((prev) => {
      const itemExistente = prev.find((item) => item.variante.id === variante.id);
      
      const stockDisponible = productos.find(p => p.id === producto.id)?.variantes.find(v => v.id === variante.id)?.cantidad ?? 0;

      if (itemExistente) {
        if (itemExistente.cantidadEnCarrito < stockDisponible) {
          return prev.map((item) =>
            item.variante.id === variante.id
              ? { ...item, cantidadEnCarrito: item.cantidadEnCarrito + 1 }
              : item
          );
        } else {
           toast({
            variant: "destructive",
            title: "Stock insuficiente",
            description: `No hay más stock para ${producto.nombre} (${variante.nombre}).`,
          });
          return prev;
        }
      } else {
        if (stockDisponible > 0) {
          return [...prev, { productoId: producto.id, nombreProducto: producto.nombre, variante, cantidadEnCarrito: 1 }];
        } else {
          toast({
            variant: "destructive",
            title: "Sin Stock",
            description: `${producto.nombre} (${variante.nombre}) no tiene stock disponible.`,
          });
          return prev;
        }
      }
    });
    setBusqueda("");
    setDialogoVariantesAbierto(false);
    setProductoSeleccionado(null);
  }, [productos, toast]);
  
  const eliminarDelCarrito = (varianteId: string) => {
    setCarrito(prev => prev.filter(item => item.variante.id !== varianteId));
  };

  const calcularCambio = () => {
    const pagado = parseFloat(montoPagado);
    if (!isNaN(pagado) && pagado >= totalCarrito) {
      setCambio(pagado - totalCarrito);
    } else {
      setCambio(null);
       toast({
        variant: "destructive",
        title: "Monto inválido",
        description: "El monto pagado debe ser un número mayor o igual al total.",
      });
    }
  };
  
  const finalizarVenta = () => {
    // 1. Crear el objeto de la nueva venta
    const nuevaVenta: Venta = {
        id: `venta-${Date.now()}`,
        items: carrito,
        total: totalCarrito,
        metodoPago: metodoPago,
        montoPagado: montoPagado ? parseFloat(montoPagado) : totalCarrito,
        cambio: cambio,
        fecha: new Date(),
        estado: 'completada',
    };
    
    // 2. Actualizar el stock de los productos
    setProductos(prevProductos => {
        const productosActualizados = JSON.parse(JSON.stringify(prevProductos));
        
        carrito.forEach(itemCarrito => {
            const productoIndex = productosActualizados.findIndex((p: Producto) => p.id === itemCarrito.productoId);
            if (productoIndex !== -1) {
                const varianteIndex = productosActualizados[productoIndex].variantes.findIndex((v: Variante) => v.id === itemCarrito.variante.id);
                if (varianteIndex !== -1) {
                    productosActualizados[productoIndex].variantes[varianteIndex].cantidad -= itemCarrito.cantidadEnCarrito;
                }
            }
        });
        
        return productosActualizados;
    });

    // 3. Añadir la venta al historial global
    setVentas(prevVentas => [...prevVentas, nuevaVenta]);
    
    // 4. Mostrar el ticket y resetear el estado local
    setVentaFinalizada(nuevaVenta);
    setDialogoTicketAbierto(true);
    setCarrito([]);
    setMontoPagado("");
    setCambio(null);
    setMetodoPago("efectivo");
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
   const stockBajoCount = productos.filter(p => {
    const stockTotal = p.variantes.reduce((sum, v) => sum + v.cantidad, 0);
    return stockTotal > 0 && stockTotal <= p.stockMinimo;
  }).length;


  // --- Lógica de la cámara ---
  React.useEffect(() => {
    if (isScanning) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error al acceder a la cámara:', error);
          setHasCameraPermission(false);
          setIsScanning(false);
          toast({
            variant: 'destructive',
            title: 'Acceso a la cámara denegado',
            description: 'Por favor, habilita los permisos de la cámara en tu navegador.',
          });
        }
      };
      getCameraPermission();
    } else {
      // Detener la cámara
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isScanning, toast]);

  // Simulación de escaneo de código de barras
  React.useEffect(() => {
    if (isScanning && hasCameraPermission) {
      const interval = setInterval(() => {
        // En una implementación real, aquí se procesaría el frame del video
        // para detectar un código de barras.
        // Por ahora, simulamos la detección de un producto aleatorio.
        const allSkus = productos.flatMap(p => p.variantes.map(v => v.sku));
        const randomSku = allSkus[Math.floor(Math.random() * allSkus.length)];
        
        let productoEncontrado: Producto | undefined;
        let varianteEncontrada: Variante | undefined;

        for (const p of productos) {
            const v = p.variantes.find(v => v.sku === randomSku);
            if (v) {
                productoEncontrado = p;
                varianteEncontrada = v;
                break;
            }
        }
        
        if (productoEncontrado && varianteEncontrada) {
          toast({
            title: "Producto Escaneado",
            description: `${productoEncontrado.nombre} (${varianteEncontrada.nombre}) añadido al carrito.`,
          });
          agregarAlCarrito(productoEncontrado, varianteEncontrada);
        }
      }, 3000); // Simula un escaneo cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [isScanning, hasCameraPermission, productos, agregarAlCarrito, toast]);

 const handleImprimirTicket = () => {
    // Lógica para imprimir el contenido del ticket
    // Esto abrirá el diálogo de impresión del navegador
    window.print();
 };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] print:block">
       <div className="hidden border-r bg-muted/40 md:block print:hidden">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <Package2 className="h-6 w-6" />
              <span className="">Tienda Ágil</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/vender"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
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
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Productos{' '}
                {stockBajoCount > 0 && (
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                    {stockBajoCount}
                  </Badge>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col print:p-0">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 print:hidden">
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
                 <Link
                  href="/vender"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
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
                  href="/"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Productos
                  {stockBajoCount > 0 && (
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                    {stockBajoCount}
                  </Badge>
                )}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             {/* Contenido del header si es necesario */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Alternar menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ajustes</DropdownMenuItem>
              <DropdownMenuItem>Soporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 print:p-0">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <div className="relative lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Nueva Venta</CardTitle>
                  <CardDescription>
                    Busca o escanea productos para añadirlos al carrito.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                 <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar por nombre o SKU..."
                        className="w-full rounded-lg bg-background pl-8"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        disabled={isScanning}
                      />
                    </div>
                    <Button
                      variant={isScanning ? "destructive" : "outline"}
                      size="icon"
                      onClick={() => setIsScanning(prev => !prev)}
                    >
                      {isScanning ? <VideoOff className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
                      <span className="sr-only">{isScanning ? 'Detener Escáner' : 'Escanear Producto'}</span>
                    </Button>
                  </div>
                  
                  {isScanning && (
                    <Card className="mt-4">
                      <CardContent className="p-2">
                         <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative">
                            <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
                            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-4 pointer-events-none">
                               <ScanLine className="h-16 w-16 text-white/80 animate-pulse" />
                               <p className="mt-2 text-sm text-center">Apunte la cámara al código de barras</p>
                            </div>
                         </div>
                         {hasCameraPermission === false && (
                           <Alert variant="destructive" className="mt-2">
                              <AlertTitle>Acceso a la cámara denegado</AlertTitle>
                              <AlertDescription>
                                Por favor, permite el acceso a la cámara en los ajustes de tu navegador para usar el escáner.
                              </AlertDescription>
                           </Alert>
                         )}
                      </CardContent>
                    </Card>
                  )}

                  {productosFiltrados.length > 0 && !isScanning && (
                    <Card className="absolute z-10 w-full mt-2">
                      <CardContent className="p-2">
                        {productosFiltrados.map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                            onClick={() => handleSeleccionProducto(p)}
                          >
                            <div>
                              <p className="font-medium">{p.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                {p.variantes.length} {p.variantes.length > 1 ? 'variantes' : 'variante'} disponible(s)
                              </p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle>Carrito</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[250px]">Producto</TableHead>
                            <TableHead>Cant.</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {carrito.length > 0 ? (
                            carrito.map((item) => (
                              <TableRow key={item.variante.id}>
                                <TableCell className="font-medium">
                                  {item.nombreProducto}
                                  <span className="text-muted-foreground text-sm block">{item.variante.nombre}</span>
                                </TableCell>
                                <TableCell>{item.cantidadEnCarrito}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.variante.precio)}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.variante.precio * item.cantidadEnCarrito)}
                                </TableCell>
                                <TableCell>
                                   <Button variant="ghost" size="icon" onClick={() => eliminarDelCarrito(item.variante.id)}>
                                      <X className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8">
                                El carrito está vacío
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            <div className="relative flex flex-col">
              <Card className="flex-grow">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(totalCarrito)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-2xl">
                    <span>Total</span>
                    <span>{formatCurrency(totalCarrito)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4">
                    <div className="grid gap-2">
                        <Label>Método de Pago</Label>
                         <Select value={metodoPago} onValueChange={setMetodoPago}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un método de pago" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="efectivo">Efectivo</SelectItem>
                                <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                                <SelectItem value="transferencia">Transferencia</SelectItem>
                                <SelectItem value="qr">Pago con QR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {metodoPago === 'efectivo' && (
                        <div className="grid gap-2">
                            <Label htmlFor="monto-pagado">Monto Pagado</Label>
                            <Input id="monto-pagado" type="number" placeholder="0.00" value={montoPagado} onChange={(e) => setMontoPagado(e.target.value)}/>
                             <Button onClick={calcularCambio} disabled={!montoPagado || totalCarrito === 0}>Calcular Cambio</Button>
                        </div>
                    )}
                   
                    {cambio !== null && metodoPago === 'efectivo' && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-muted-foreground">Cambio a devolver:</p>
                            <p className="text-3xl font-bold text-primary">{formatCurrency(cambio)}</p>
                        </div>
                    )}
                    <Button size="lg" className="w-full mt-4" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}} onClick={finalizarVenta} disabled={carrito.length === 0 || (metodoPago === 'efectivo' && totalCarrito > 0 && cambio === null)}>
                        Finalizar Venta
                    </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={dialogoVariantesAbierto} onOpenChange={setDialogoVariantesAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Variante</DialogTitle>
            <DialogDescription>
              El producto "{productoSeleccionado?.nombre}" tiene múltiples variantes. Por favor, selecciona una.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variante</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productoSeleccionado?.variantes.map(v => (
                    <TableRow 
                      key={v.id} 
                      onClick={() => agregarAlCarrito(productoSeleccionado, v)} 
                      className="cursor-pointer hover:bg-muted"
                    >
                      <TableCell>{v.nombre}</TableCell>
                      <TableCell><Badge variant="outline">{v.sku}</Badge></TableCell>
                      <TableCell className="text-right">{v.cantidad}</TableCell>
                      <TableCell className="text-right">{formatCurrency(v.precio)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
        </DialogContent>
      </Dialog>

    <Dialog open={dialogoTicketAbierto} onOpenChange={setDialogoTicketAbierto}>
      <DialogContent className="sm:max-w-md print:shadow-none print:border-none">
        <div id="ticket">
            <DialogHeader>
                <DialogTitle className="text-center">¡Venta Exitosa!</DialogTitle>
                <DialogDescription className="text-center">
                    Resumen de la Transacción
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                    <p>Tienda Ágil S.A.S.</p>
                    <p>NIT: 900.123.456-7</p>
                    <p>Calle Falsa 123, Bogotá</p>
                    <p>{ventaFinalizada?.fecha.toLocaleString('es-CO')}</p>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ventaFinalizada?.items.map(item => (
                            <TableRow key={item.variante.id}>
                                <TableCell>
                                    {item.cantidadEnCarrito} x {item.nombreProducto} ({item.variante.nombre})
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(item.cantidadEnCarrito * item.variante.precio)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="space-y-1 border-t pt-2 mt-2">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(ventaFinalizada?.total ?? 0)}</span>
                    </div>
                     <div className="flex justify-between font-bold text-lg">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(ventaFinalizada?.total ?? 0)}</span>
                    </div>
                </div>
                 <div className="text-center text-sm space-y-1 border-t pt-4 mt-4">
                    <p>Pagado con: <span className="font-medium capitalize">{ventaFinalizada?.metodoPago}</span></p>
                    {ventaFinalizada?.metodoPago === 'efectivo' && (
                        <>
                        <p>Monto Pagado: {formatCurrency(ventaFinalizada?.montoPagado ?? 0)}</p>
                        <p>Cambio: {formatCurrency(ventaFinalizada?.cambio ?? 0)}</p>
                        </>
                    )}
                    <p className="pt-4">¡Gracias por tu compra!</p>
                </div>
            </div>
        </div>
        <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setDialogoTicketAbierto(false)}>Cerrar</Button>
            <Button onClick={handleImprimirTicket}>
                <Printer className="mr-2"/>
                Imprimir Ticket
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </div>
  );
}

    