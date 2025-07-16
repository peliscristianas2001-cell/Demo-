
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
import type { Voucher, VoucherLayout } from "@/lib/types"
import { Gift, Sparkles, Upload, FileImage, MessageSquare, Palette } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Logo } from "@/components/logo"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"


interface VoucherFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (voucher: Voucher) => void
  voucher: Voucher | null
}

const defaultVoucherImage = "https://placehold.co/600x400.png"

const VoucherPreview = ({ voucherData }: { voucherData: Partial<Voucher> }) => {
    const { 
        layout = 'classic',
        imageUrl = defaultVoucherImage,
        title = "Título del Voucher",
        code = "YTL-XXXXXXXX",
        value = 0,
        recipientName,
        senderName,
        message,
        expiryDate
     } = voucherData;

     const formattedValue = `$${value ? parseFloat(String(value)).toLocaleString('es-AR') : '0'}`
     const formattedDate = expiryDate ? format(expiryDate, "dd 'de' LLLL 'de' yyyy", { locale: es }) : 'dd/mm/aaaa'

    if (layout === 'classic') {
        return (
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-between p-6 text-white bg-gray-900">
                <Image 
                    src={imageUrl} 
                    alt="Fondo del voucher" 
                    layout="fill" 
                    objectFit="cover" 
                    className="z-0 brightness-50 group-hover:brightness-75 transition-all duration-300"
                    data-ai-hint="abstract texture"
                />
                <div className="relative z-10 flex justify-between items-start">
                    <div className="font-headline text-2xl tracking-wider uppercase">{title}</div>
                    <Gift className="w-8 h-8 opacity-80"/>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    {recipientName && <p className="text-sm opacity-80">Para: {recipientName}</p>}
                    <p className="text-4xl lg:text-5xl font-bold mt-1 text-amber-300 drop-shadow-lg">{formattedValue}</p>
                    <p className="font-mono text-lg tracking-widest mt-2 bg-black/30 px-3 py-1 rounded-md border border-white/20">{code}</p>
                    {senderName && <p className="text-sm opacity-80 mt-2">De: {senderName}</p>}
                </div>
                <div className="relative z-10 text-right">
                    <p className="text-xs opacity-70">Válido hasta: {formattedDate}</p>
                </div>
            </div>
        )
    }

    if (layout === 'modern') {
        return (
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-2xl group flex bg-gradient-to-br from-primary/80 to-accent/90">
                <div className="w-2/3 p-6 flex flex-col justify-between text-white">
                    <div>
                        <h3 className="font-headline text-2xl uppercase tracking-wider">{title}</h3>
                        <p className="text-sm opacity-80">De: {senderName || "YO TE LLEVO"}</p>
                    </div>
                    <div>
                        <p className="font-mono text-xl tracking-widest bg-black/20 px-4 py-2 rounded-lg inline-block">{code}</p>
                        <p className="text-xs opacity-70 mt-2">Vence: {formattedDate}</p>
                    </div>
                </div>
                <div className="w-1/3 bg-white/90 flex flex-col items-center justify-center text-center text-primary p-4">
                    <p className="text-sm">Valor</p>
                    <p className="text-4xl font-bold">{formattedValue}</p>
                    {recipientName && <p className="text-xs mt-2">Para: {recipientName}</p>}
                </div>
            </div>
        )
    }
    
    if (layout === 'minimal') {
        return (
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-center items-center p-6 text-center bg-secondary/30 border-2 border-dashed border-primary/50">
                <h3 className="font-headline text-2xl uppercase tracking-wider text-primary">{title}</h3>
                <p className="text-5xl font-bold my-4 text-foreground">{formattedValue}</p>
                <p className="font-mono text-lg tracking-widest bg-background px-4 py-2 rounded-lg border">{code}</p>
                <p className="text-xs text-muted-foreground mt-4">Válido hasta: {formattedDate}</p>
            </div>
        )
    }

    return null;
}


export function VoucherForm({ isOpen, onOpenChange, onSave, voucher }: VoucherFormProps) {
  const [formData, setFormData] = useState<Partial<Voucher>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    if (voucher) {
      setFormData({
        title: voucher.title || "Voucher de Descuento",
        code: voucher.code,
        value: voucher.value,
        quantity: voucher.quantity,
        expiryDate: voucher.expiryDate,
        layout: voucher.layout || "classic",
        imageUrl: voucher.imageUrl || defaultVoucherImage,
        recipientName: voucher.recipientName || "",
        senderName: voucher.senderName || "",
        message: voucher.message || ""
      })
    } else {
      // Reset form for new voucher
      setFormData({
        title: "Voucher de Descuento",
        code: generateVoucherCode(),
        value: "",
        quantity: 1,
        expiryDate: undefined,
        layout: "classic",
        imageUrl: defaultVoucherImage,
        recipientName: "",
        senderName: "YO TE LLEVO",
        message: "¡Válido para tu próxima gran aventura!"
      })
    }
    setImageFile(null)
  }, [voucher, isOpen])

  const handleInputChange = (field: keyof Voucher, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  }

  const generateVoucherCode = () => {
    return `YTL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        handleInputChange('imageUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleNumericChange = (field: 'value' | 'quantity') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]\d*$/.test(value)) {
       handleInputChange(field, value)
    }
  };

  const handleSubmit = () => {
    const { code, expiryDate, value, quantity, layout } = formData;
    if (!code || !expiryDate || !value || !quantity || !layout || parseFloat(String(value)) <= 0 || parseInt(String(quantity)) <= 0) {
      toast({
        title: "Faltan datos",
        description: "Por favor, completa código, valor, cantidad, diseño y fecha de vencimiento.",
        variant: "destructive"
      })
      return
    }

    onSave({
      id: voucher?.id || "",
      status: voucher?.status || "Activo",
      ...formData
    } as Voucher)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{voucher ? "Editar Voucher" : "Crear Nuevo Voucher"}</DialogTitle>
          <DialogDescription>
            {voucher ? "Modifica los detalles del voucher." : "Completa los detalles y previsualiza cómo se verá la tarjeta."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6">
                {/* Form Fields */}
                <div className="space-y-4 md:col-span-2">
                     <div className="space-y-3 p-4 border rounded-lg">
                        <Label className="text-base font-medium flex items-center gap-2"><Palette className="w-5 h-5"/> Elige un Diseño</Label>
                         <RadioGroup 
                            value={formData.layout} 
                            onValueChange={(value: VoucherLayout) => handleInputChange('layout', value)}
                            className="grid grid-cols-3 gap-4"
                        >
                            { (['classic', 'modern', 'minimal'] as VoucherLayout[]).map(layout => (
                                <div key={layout}>
                                    <RadioGroupItem value={layout} id={layout} className="sr-only peer" />
                                    <Label 
                                        htmlFor={layout}
                                        className="block p-2 border-2 border-muted bg-popover rounded-md cursor-pointer peer-data-[state=checked]:border-primary hover:border-primary/70 transition-colors"
                                    >
                                        <div className="w-full h-20 bg-muted rounded-sm flex items-center justify-center text-sm font-semibold capitalize overflow-hidden">
                                           <VoucherPreview voucherData={{ ...formData, layout: layout }} />
                                        </div>
                                    </Label>
                                </div>
                            )) }
                        </RadioGroup>
                    </div>
                </div>


                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título del Voucher</Label>
                        <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Ej: Voucher de Descuento" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Código del Voucher</Label>
                        <Input id="code" value={formData.code} onChange={(e) => handleInputChange('code', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="value">Valor ($)</Label>
                        <Input id="value" type="text" value={String(formData.value || "")} onChange={handleNumericChange('value')} placeholder="Ej: 25000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input id="quantity" type="text" value={String(formData.quantity || "")} onChange={handleNumericChange('quantity')} placeholder="Ej: 10" />
                    </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                        <DatePicker date={formData.expiryDate} setDate={(d) => handleInputChange('expiryDate', d)} className="h-10 w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipientName">Para (Destinatario)</Label>
                        <Input id="recipientName" value={formData.recipientName} onChange={(e) => handleInputChange('recipientName', e.target.value)} placeholder="Nombre de quien recibe"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="senderName">De (Remitente)</Label>
                        <Input id="senderName" value={formData.senderName} onChange={(e) => handleInputChange('senderName', e.target.value)} placeholder="Tu nombre o 'YO TE LLEVO'"/>
                    </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Mensaje</Label>
                        <Textarea id="message" value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Unas palabras para el agasajado..." />
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

                    <Button onClick={() => handleInputChange('code', generateVoucherCode())} variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar nuevo código
                    </Button>
                </div>

                {/* Voucher Preview */}
                <div className="space-y-4">
                <Label>Vista Previa de la Tarjeta</Label>
                    <VoucherPreview voucherData={formData} />
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
