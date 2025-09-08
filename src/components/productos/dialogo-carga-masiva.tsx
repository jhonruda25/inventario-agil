
"use client"

import * as React from "react"
import Papa from "papaparse"
import { UploadCloud, File, X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Producto, Variante } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

type CsvRow = {
  nombre: string;
  sku: string;
  precio: string;
  cantidad: string;
  stockMinimo: string;
  variante_nombre: string;
};

type DialogoCargaMasivaProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCarga: (productos: Omit<Producto, 'id'>[]) => void
}

export function DialogoCargaMasiva({ open, onOpenChange, onCarga }: DialogoCargaMasivaProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        setError("Por favor, selecciona un archivo CSV.")
        return
      }
      setError(null)
      setFile(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const processFile = () => {
    if (!file) {
      setError("No se ha seleccionado ningún archivo.")
      return
    }

    setLoading(true)
    setError(null)

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const nuevosProductos = parseCsvData(results.data);
          onCarga(nuevosProductos);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "Error desconocido al procesar el archivo.";
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Error en el archivo CSV",
            description: errorMessage,
          });
        } finally {
          setLoading(false);
          setFile(null);
        }
      },
      error: (err) => {
        setError(`Error al leer el archivo: ${err.message}`)
        setLoading(false)
      },
    })
  }
  
  const parseCsvData = (data: CsvRow[]): Omit<Producto, 'id'>[] => {
    const productosAgrupados: { [key: string]: Omit<Producto, 'id'> & { variantes: Variante[] } } = {};

    data.forEach((row, index) => {
        const { nombre, sku, precio, cantidad, stockMinimo, variante_nombre } = row;

        if (!nombre || !sku || !precio || !cantidad || !stockMinimo || !variante_nombre) {
            throw new Error(`La fila ${index + 2} está incompleta. Asegúrate de que todas las columnas requeridas tengan un valor.`);
        }

        if (!productosAgrupados[nombre]) {
            productosAgrupados[nombre] = {
                nombre: nombre,
                stockMinimo: parseInt(stockMinimo, 10),
                ultimaModificacion: new Date().toISOString().split('T')[0],
                historialVentas: [],
                tasaVentaDiaria: 0,
                leadTime: 7, // Valor por defecto
                variantes: [],
            };
        }
        
        const variante: Variante = {
            id: `var-${Date.now()}-${sku}`,
            nombre: variante_nombre,
            sku: sku,
            cantidad: parseInt(cantidad, 10),
            precio: parseFloat(precio),
        };
        
        if (isNaN(variante.cantidad) || isNaN(variante.precio) || isNaN(productosAgrupados[nombre].stockMinimo)) {
            throw new Error(`La fila ${index + 2} contiene valores no numéricos en las columnas de precio, cantidad o stockMinimo.`);
        }

        productosAgrupados[nombre].variantes.push(variante);
    });

    return Object.values(productosAgrupados);
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Productos</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV para añadir múltiples productos a tu inventario de una sola vez.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div 
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer
                ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                onDrop={handleDrop}
                onDragOver={handleDragEnter}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv"
                    onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                />
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                    Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionarlo.
                </p>
            </div>

            {file && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                        <File className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

             <Alert variant="default" className="mt-4">
                <AlertTitle>Formato del Archivo CSV</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">El archivo debe tener las siguientes columnas:</p>
                    <code className="text-xs p-1 bg-muted rounded-sm">nombre,sku,precio,cantidad,stockMinimo,variante_nombre</code>
                    <p className="mt-2 text-xs text-muted-foreground">
                       Las filas con el mismo `nombre` de producto se agruparán como variantes de ese producto.
                    </p>
                </AlertDescription>
            </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={processFile} disabled={!file || loading}>
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                </>
            ) : "Subir y Procesar Archivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
