
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
import type { Voucher, BackgroundOptions, BorderOptions, StripesOptions } from "@/lib/types"
import { Gift, Sparkles, Upload, FileImage, MessageSquare, Palette, Ruler, Users, Ticket, Layers, Brush } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface VoucherFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (voucher: Voucher) => void
  voucher: Voucher | null
}


const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || typeof hex !== 'string') hex = '#000000';
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const VoucherPreview = ({ voucherData }: { voucherData: Partial<Voucher> }) => {
    const { 
        title = "Título del Voucher",
        code = "YTL-XXXXXXXX",
        value = 0,
        recipientName,
        expiryDate,
        width = 500,
        height = 300,
        background = { type: 'solid', color: '#cccccc' },
        border = { enabled: false },
        stripes = { enabled: false, color: '#ffffff', opacity: 0.3 },
        message
     } = voucherData;

     const formattedValue = `$${value ? parseFloat(String(value)).toLocaleString('es-AR') : '0'}`
     const formattedDate = expiryDate ? format(new Date(expiryDate), "dd 'de' LLLL 'de' yyyy", { locale: es }) : 'dd/mm/aaaa'

    const backgroundStyles: React.CSSProperties = {};
    if (background?.type === 'solid') {
        backgroundStyles.backgroundColor = background.color;
    } else if (background?.type === 'gradient') {
        backgroundStyles.background = `linear-gradient(to bottom right, ${background.color1}, ${background.color2})`;
    }

    const borderStyles: React.CSSProperties = {};
    if (border?.enabled) {
        borderStyles.border = `${border.width || 4}px solid ${border.color || '#ffffff'}`;
    }

    const stripesColorWithOpacity = hexToRgba(stripes?.color || '#ffffff', stripes?.opacity ?? 0.3);

    const cardStyle = {
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: 'none', // Allow it to be wider than container
        ...backgroundStyles,
        ...borderStyles
    };

    return (
        <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-between p-6 text-white shrink-0"
            style={cardStyle}
        >
            {background?.type === 'image' && background.imageUrl && (
                 <Image 
                    src={background.imageUrl}
                    alt="Fondo del voucher" 
                    layout="fill" 
                    objectFit="cover" 
                    className="z-0 brightness-50 group-hover:brightness-75 transition-all duration-300"
                    data-ai-hint="abstract texture"
                />
            )}
             {stripes?.enabled && (
                <>
                    <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: stripesColorWithOpacity }} />
                    <div className="absolute bottom-0 left-0 w-full h-4" style={{ backgroundColor: stripesColorWithOpacity }} />
                </>
            )}
            
            <div className="relative z-10 flex justify-between items-start">
                <div className="font-headline text-2xl tracking-wider uppercase">{title}</div>
                <Gift className="w-8 h-8 opacity-80"/>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {recipientName && <p className="text-sm opacity-80">Para: {recipientName}</p>}
                <p className="text-4xl lg:text-5xl font-bold mt-1 drop-shadow-lg">${value ? parseFloat(String(value)).toLocaleString('es-AR') : '0'}</p>
                <p className="font-mono text-lg tracking-widest mt-2 bg-black/30 px-3 py-1 rounded-md border border-white/20">{code}</p>
                {message && <p className="text-sm opacity-80 mt-2 italic">"{message}"</p>}
            </div>
            
            <div className="relative z-10 text-right">
                <p className="text-xs opacity-70">
                    Válido hasta: {expiryDate ? format(new Date(expiryDate), "dd 'de' LLLL 'de' yyyy", { locale: es }) : "dd/mm/aaaa"}
                </p>
            </div>
        </div>
    );
};

const generateVoucherCode = () => {
    return `YTL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
}

export function VoucherForm({ isOpen, onOpenChange, onSave, voucher }: VoucherFormProps) {
  const [formData, setFormData] = useState<Partial<Voucher>>({})
  
  const { toast } = useToast()

  const defaultValues: Partial<Voucher> = {
    title: "Voucher de Descuento",
    code: generateVoucherCode(),
    value: 0,
    quantity: 1,
    expiryDate: undefined,
    width: 500,
    height: 300,
    background: {
      type: 'solid',
      color: '#3b82f6',
      color1: '#3b82f6',
      color2: '#ef4444',
      imageUrl: ''
    },
    border: {
        enabled: false,
        color: '#ffffff',
        width: 4
    },
    stripes: {
        enabled: false,
        color: '#ffffff',
        opacity: 0.3,
    },
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
        ...voucher,
        background: { ...defaultValues.background, ...voucher.background },
        border: { ...defaultValues.border, ...voucher.border },
        stripes: { ...defaultValues.stripes, ...voucher.stripes },
      })
    } else {
      // Reset form for new voucher
      setFormData(defaultValues)
    }
  }, [voucher, isOpen])

  const handleInputChange = (field: keyof Voucher, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  }

  const handleNestedChange = (
    object: 'background' | 'border' | 'stripes',
    field: keyof BackgroundOptions | keyof BorderOptions | keyof StripesOptions,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [object]: {
        ...(prev[object] as object),
        [field]: value
      }
    }));
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
      const reader = new FileReader()
      reader.onloadend = () => {
        handleNestedChange('background', 'imageUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
        handleNestedChange('background', 'imageUrl', '')
    }
  }

  const handleSubmit = () => {
    const { code, expiryDate, value, quantity } = formData;
    if (!code || !expiryDate || value === undefined || quantity === undefined || parseFloat(String(value)) < 0 || parseInt(String(quantity)) < 0) {
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
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 md:overflow-hidden">
            <div className="flex flex-col md:overflow-hidden">
                {/* Preview for mobile */}
                <div className="md:hidden p-4 space-y-2">
                    <Label>Vista Previa de la Tarjeta</Label>
                    <div className="w-full p-4 bg-muted rounded-lg flex items-center justify-start overflow-auto">
                        <VoucherPreview voucherData={formData} />
                    </div>
                </div>

                <ScrollArea className="flex-1 md:pr-6">
                    <div className="p-6 md:p-0 md:py-6 space-y-6">
                    
                    <div className="space-y-3 p-4 border rounded-lg">
                        <Label className="text-base font-medium flex items-center gap-2"><Palette className="w-5 h-5"/> Diseño del Voucher</Label>
                         <div className="space-y-2">
                            <Label htmlFor="width">Dimensiones (Ancho x Alto en px)</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <Input id="width" type="number" value={formData.width || ''} onChange={(e) => handleNumericInputChange('width', e.target.value)} placeholder="500" />
                                <Input id="height" type="number" value={formData.height || ''} onChange={(e) => handleNumericInputChange('height', e.target.value)} placeholder="300" />
                            </div>
                         </div>
                         <div className="space-y-3 p-4 border rounded-lg bg-background/50">
                            <Label className="text-base font-medium flex items-center gap-2"><Layers className="w-5 h-5"/> Fondo</Label>
                            <Select onValueChange={(v: 'solid' | 'gradient' | 'image') => handleNestedChange('background', 'type', v)} value={formData.background?.type}>
                                <SelectTrigger><SelectValue placeholder="Tipo de fondo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solid">Color Sólido</SelectItem>
                                    <SelectItem value="gradient">Gradiente</SelectItem>
                                    <SelectItem value="image">Imagen</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            {formData.background?.type === 'solid' && (
                                <div className="space-y-2 animate-fade-in-down">
                                    <Label htmlFor="backgroundColor">Color de Fondo</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="backgroundColor" type="color" value={formData.background?.color || '#000000'} onChange={(e) => handleNestedChange('background', 'color', e.target.value)} className="w-12 h-10 p-1"/>
                                        <Input type="text" value={formData.background?.color || ''} onChange={(e) => handleNestedChange('background', 'color', e.target.value)} placeholder="#3b82f6" />
                                    </div>
                                </div>
                            )}

                            {formData.background?.type === 'gradient' && (
                                <div className="space-y-4 animate-fade-in-down">
                                    <div className="space-y-2">
                                        <Label htmlFor="gradientColor1">Color 1</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="gradientColor1" type="color" value={formData.background?.color1 || '#000000'} onChange={(e) => handleNestedChange('background', 'color1', e.target.value)} className="w-12 h-10 p-1"/>
                                            <Input type="text" value={formData.background?.color1 || ''} onChange={(e) => handleNestedChange('background', 'color1', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gradientColor2">Color 2</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="gradientColor2" type="color" value={formData.background?.color2 || '#000000'} onChange={(e) => handleNestedChange('background', 'color2', e.target.value)} className="w-12 h-10 p-1"/>
                                            <Input type="text" value={formData.background?.color2 || ''} onChange={(e) => handleNestedChange('background', 'color2', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.background?.type === 'image' && (
                                <div className="space-y-2 animate-fade-in-down">
                                    <Label htmlFor="imageUpload" className="flex items-center gap-2"><FileImage className="w-4 h-4"/> Sube una imagen</Label>
                                    <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} className="file:text-primary-foreground file:font-bold file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-primary hover:file:bg-primary/90"/>
                                </div>
                            )}
                         </div>

                        <div className="space-y-3 p-4 border rounded-lg bg-background/50">
                            <Label className="text-base font-medium flex items-center gap-2"><Brush className="w-5 h-5"/> Bordes y Franjas</Label>
                            <div className="flex items-center space-x-2">
                                <Switch id="border-enabled" checked={formData.border?.enabled} onCheckedChange={(c) => handleNestedChange('border', 'enabled', c)} />
                                <Label htmlFor="border-enabled">Habilitar Borde</Label>
                            </div>
                            {formData.border?.enabled && (
                                <div className="grid grid-cols-2 gap-4 pl-8 animate-fade-in-down">
                                    <div className="space-y-2">
                                        <Label htmlFor="borderWidth">Grosor (px)</Label>
                                        <Input id="borderWidth" type="number" value={formData.border?.width || ''} onChange={(e) => handleNestedChange('border', 'width', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="borderColor">Color</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="borderColor" type="color" value={formData.border?.color || '#ffffff'} onChange={(e) => handleNestedChange('border', 'color', e.target.value)} className="w-12 h-10 p-1"/>
                                            <Input type="text" value={formData.border?.color || ''} onChange={(e) => handleNestedChange('border', 'color', e.target.value)} placeholder="#ffffff" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Switch id="stripes-enabled" checked={formData.stripes?.enabled} onCheckedChange={(c) => handleNestedChange('stripes', 'enabled', c)} />
                                <Label htmlFor="stripes-enabled">Habilitar Franjas</Label>
                            </div>
                             {formData.stripes?.enabled && (
                                <div className="space-y-4 pl-8 animate-fade-in-down">
                                    <div className="space-y-2">
                                        <Label htmlFor="stripesColor">Color</Label>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                id="stripesColorPicker"
                                                type="color"
                                                value={formData.stripes?.color || '#ffffff'} 
                                                onChange={(e) => handleNestedChange('stripes', 'color', e.target.value)} 
                                                className="w-12 h-10 p-1"
                                            />
                                            <Input 
                                                id="stripesColor"
                                                type="text" 
                                                value={formData.stripes?.color || ''} 
                                                onChange={(e) => handleNestedChange('stripes', 'color', e.target.value)} 
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="stripesOpacity">Opacidad ({Math.round((formData.stripes?.opacity ?? 0.3) * 100)}%)</Label>
                                        <Slider
                                            id="stripesOpacity"
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            value={[formData.stripes?.opacity ?? 0.3]}
                                            onValueChange={(value) => handleNestedChange('stripes', 'opacity', value[0])}
                                        />
                                    </div>
                                </div>
                            )}
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
                         <Label className="text-base font-medium flex items-center gap-2"><Users className="w-5 h-5"/> Condiciones de Visibilidad</Label>
                        <Select onValueChange={(value: "all" | "registered") => handleInputChange('visibility', value)} value={formData.visibility}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar visibilidad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Mostrar a todos los visitantes</SelectItem>
                                <SelectItem value="registered">Mostrar solo a clientes registrados</SelectItem>
                            </SelectContent>
                        </Select>

                         {formData.visibility === 'registered' && (
                            <div className="p-3 mt-2 space-y-2 rounded-lg bg-background/70 border-l-4 border-primary animate-fade-in-down">
                                <Label htmlFor="minTrips" className="font-semibold">
                                    Condición para Clientes
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Mínimo de viajes completados para ver este voucher:
                                </p>
                                <Input
                                    id="minTrips"
                                    type="number"
                                    value={formData.minTrips || 1}
                                    onChange={(e) => handleInputChange('minTrips', parseInt(e.target.value) || 1)}
                                    className="w-48"
                                    min="1"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 p-4 border rounded-lg">
                         <Label className="text-base font-medium flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Contenido Personalizado</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </ScrollArea>
            </div>


            {/* Voucher Preview for Desktop */}
            <div className="hidden md:flex flex-col space-y-4 p-6">
                <Label>Vista Previa de la Tarjeta</Label>
                <div className="w-full h-full p-4 bg-muted rounded-lg flex items-center justify-center overflow-auto sticky top-4">
                    <VoucherPreview voucherData={formData} />
                </div>
            </div>
        </div>
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
