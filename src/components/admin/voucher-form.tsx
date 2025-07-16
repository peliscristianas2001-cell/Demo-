
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import type { Voucher } from "@/lib/types"
import { Gift, Sparkles, Upload, FileImage, MessageSquare, Palette, Ruler, UserCheck, Ticket, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


interface VoucherFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (voucher: Voucher) => void
  voucher: Voucher | null
}

const VoucherPreview = ({ voucherData }: { voucherData: Partial<Voucher> }) => {
    const { 
        imageUrl,
        title = "Título del Voucher",
        code = "YTL-XXXXXXXX",
        value = 0,
        recipientName,
        senderName,
        expiryDate,
        width = 500,
        height = 300,
        backgroundColor = "#cccccc",
        message
     } = voucherData;

     const formattedValue = `$${value ? parseFloat(String(value)).toLocaleString('es-AR') : '0'}`
     const formattedDate = expiryDate ? format(expiryDate, "dd 'de' LLLL 'de' yyyy", { locale: es }) : 'dd/mm/aaaa'

    const previewStyle = {
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: imageUrl ? 'transparent' : backgroundColor
    };

    return (
        <div
            className="relative rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-between p-6 text-white max-w-full max-h-[400px] mx-auto"
            style={previewStyle}
        >
             {imageUrl && (
                <Image 
                    src={imageUrl} 
                    alt="Fondo del voucher" 
                    layout="fill" 
                    objectFit="cover" 
                    className="z-0 brightness-50 group-hover:brightness-75 transition-all duration-300"
                    data-ai-hint="abstract texture"
                />
            )}
            <div className="relative z-10 flex justify-between items-start">
                <div className="font-headline text-2xl tracking-wider uppercase">{title}</div>
                <Gift className="w-8 h-8 opacity-80"/>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
                {recipientName && <p className="text-sm opacity-80">Para: {recipientName}</p>}
                <p className="text-4xl lg:text-5xl font-bold mt-1 text-amber-300 drop-shadow-lg">{formattedValue}</p>
                <p className="font-mono text-lg tracking-widest mt-2 bg-black/30 px-3 py-1 rounded-md border border-white/20">{code}</p>
                {message && <p className="text-sm opacity-80 mt-2 italic">"{message}"</p>}
            </div>
            <div className="relative z-10 text-right">
                <p className="text-xs opacity-70">Válido hasta: {formattedDate}</p>
            </div>
        </div>
    )
}


export function VoucherForm({ isOpen, onOpenChange, onSave, voucher }: VoucherFormProps) {
  const [formData, setFormData] = useState<Partial<Voucher>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const { toast } = useToast()

  const generateVoucherCode = () => {
    return `YTL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  }

  const defaultValues: Partial<Voucher> = {
    title: "Voucher de Descuento",
    code: generateVoucherCode(),
    value: "",
    quantity: 1,
    expiryDate: undefined,
    width: 500,
    height: 300,
    backgroundColor: "#3b82f6", // tailwind's blue-500
    imageUrl: "",
    recipientName: "",
    senderName: "YO TE LLEVO",
    message: "¡Válido para tu próxima gran aventura!",
    visibility: "all",
    minTrips: 1,
  }

  useEffect(() => {
    if (voucher) {
      setFormData({
        ...defaultValues,
        ...voucher
      })
    } else {
      // Reset form for new voucher
      setFormData(defaultValues)
    }
    setImageFile(null)
  }, [voucher, isOpen])

  const handleInputChange = (field: keyof Voucher, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  }
  
  const handleNumericInputChange = (field: keyof Voucher, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
        handleInputChange(field, num);
    } else if (value === "") {
        handleInputChange(field, "");
    }
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        handleInputChange('imageUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
        handleInputChange('imageUrl', '');
    }
  }

  const handleSubmit = () => {
    const { code, expiryDate, value, quantity } = formData;
    if (!code || !expiryDate || !value || quantity === undefined || parseFloat(String(value)) <= 0 || parseInt(String(quantity)) < 0) {
      toast({
        title: "Faltan datos",
        description: "Por favor, completa código, valor, cantidad, y fecha de vencimiento.",
        variant: "destructive"
      })
      return
    }

    onSave({
      id: voucher?.id || "",
      status: voucher?.status || "Activo",
      ...defaultValues, // ensure all fields are present
      ...formData
    } as Voucher)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{voucher ? "Editar Voucher" : "Crear Nuevo Voucher"}</DialogTitle>
          <DialogDescription>
            {voucher ? "Modifica los detalles del voucher." : "Completa los detalles y personaliza el diseño de la tarjeta."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6">
                {/* Form Fields */}
                <div className="space-y-4">
                     <div className="space-y-3 p-4 border rounded-lg">
                        <Label className="text-base font-medium flex items-center gap-2"><Palette className="w-5 h-5"/> Diseño del Voucher</Label>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="width">Ancho (px)</Label>
                                <Input id="width" type="number" value={formData.width || ''} onChange={(e) => handleNumericInputChange('width', e.target.value)} placeholder="500" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Alto (px)</Label>
                                <Input id="height" type="number" value={formData.height || ''} onChange={(e) => handleNumericInputChange('height', e.target.value)} placeholder="300" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="backgroundColor">Color de Fondo</Label>
                            <div className="flex items-center gap-2">
                                <Input id="backgroundColor" type="color" value={formData.backgroundColor || '#000000'} onChange={(e) => handleInputChange('backgroundColor', e.target.value)} className="w-12 h-10 p-1" />
                                <Input type="text" value={formData.backgroundColor || ''} onChange={(e) => handleInputChange('backgroundColor', e.target.value)} placeholder="#3b82f6" />
                            </div>
                         </div>
                          <div className="space-y-2">
                            <Label htmlFor="imageUpload" className="flex items-center gap-2"><FileImage className="w-4 h-4"/> Imagen de Fondo (Opcional)</Label>
                            <Input 
                                id="imageUpload" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                className="file:text-primary-foreground file:font-bold file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-primary hover:file:bg-primary/90"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 p-4 border rounded-lg">
                        <Label className="text-base font-medium flex items-center gap-2"><Ticket className="w-5 h-5"/> Datos del Voucher</Label>
                        <div className="space-y-2">
                            <Label htmlFor="title">Título del Voucher</Label>
                            <Input id="title" value={formData.title || ""} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Ej: Voucher de Descuento" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Código del Voucher</Label>
                            <Input id="code" value={formData.code || ""} onChange={(e) => handleInputChange('code', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value">Valor ($)</Label>
                            <Input id="value" type="text" value={String(formData.value || "")} onChange={(e) => handleInputChange('value', e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ej: 25000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input id="quantity" type="text" value={String(formData.quantity || "")} onChange={(e) => handleInputChange('quantity', e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ej: 10" />
                        </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                            <DatePicker date={formData.expiryDate} setDate={(d) => handleInputChange('expiryDate', d)} className="h-10 w-full" />
                        </div>
                    </div>

                    <div className="space-y-3 p-4 border rounded-lg">
                         <Label className="text-base font-medium flex items-center gap-2"><Users className="w-5 h-5"/> Visibilidad y Condiciones</Label>
                         <RadioGroup 
                            value={formData.visibility} 
                            onValueChange={(value: "all" | "registered") => handleInputChange('visibility', value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="r1" />
                                <Label htmlFor="r1">Mostrar a todos los visitantes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="registered" id="r2" />
                                <Label htmlFor="r2">Mostrar solo a clientes registrados</Label>
                            </div>
                        </RadioGroup>
                         {formData.visibility === 'registered' && (
                            <div className="p-4 space-y-3 rounded-lg bg-background/70 border-l-4 border-primary animate-fade-in-down">
                                <Label htmlFor="minTrips" className="flex items-center gap-2 font-semibold">
                                    <UserCheck className="w-5 h-5"/>
                                    Condición para Clientes
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Mínimo de viajes completados para ver este voucher:
                                </p>
                                <Input
                                    id="minTrips"
                                    type="number"
                                    value={formData.minTrips}
                                    onChange={(e) => handleInputChange('minTrips', parseInt(e.target.value) || 1)}
                                    className="w-48"
                                    min="1"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 p-4 border rounded-lg">
                         <Label className="text-base font-medium flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Contenido Personalizado</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="recipientName">Para (Destinatario)</Label>
                                <Input id="recipientName" value={formData.recipientName || ""} onChange={(e) => handleInputChange('recipientName', e.target.value)} placeholder="Nombre de quien recibe"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="senderName">De (Remitente)</Label>
                                <Input id="senderName" value={formData.senderName || ""} onChange={(e) => handleInputChange('senderName', e.target.value)} placeholder="Tu nombre o 'YO TE LLEVO'"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Mensaje</Label>
                            <Textarea id="message" value={formData.message || ""} onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Unas palabras para el agasajado..." />
                        </div>
                    </div>

                    <Button onClick={() => handleInputChange('code', generateVoucherCode())} variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar nuevo código
                    </Button>
                </div>

                {/* Voucher Preview */}
                <div className="space-y-4">
                <Label>Vista Previa de la Tarjeta</Label>
                    <div className="w-full p-4 bg-muted rounded-lg flex items-center justify-center overflow-auto">
                        <VoucherPreview voucherData={formData} />
                    </div>
                <p className={cn("text-xs text-muted-foreground text-center italic flex items-center gap-2 justify-center", !formData.message && "opacity-0")}>
                    <MessageSquare className="w-4 h-4" />
                    Mensaje incluido: "{formData.message}"
                </p>
                </div>
            </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 mt-auto border-t bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>
            <Upload className="mr-2 h-4 w-4" />
            {voucher ? "Guardar Cambios" : "Guardar Voucher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
