
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
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import type { Voucher } from "@/lib/types"
import { Gift, Sparkles, Upload } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface VoucherFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (voucher: Voucher) => void
  voucher: Voucher | null
}

const defaultVoucherImage = "https://placehold.co/600x400.png"

export function VoucherForm({ isOpen, onOpenChange, onSave, voucher }: VoucherFormProps) {
  const [code, setCode] = useState("")
  const [value, setValue] = useState("")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>()
  const [imageUrl, setImageUrl] = useState(defaultVoucherImage)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    if (voucher) {
      setCode(voucher.code)
      setValue(String(voucher.value))
      setExpiryDate(voucher.expiryDate)
      setImageUrl(voucher.imageUrl || defaultVoucherImage)
    } else {
      // Reset form for new voucher
      setCode(generateVoucherCode())
      setValue("")
      setExpiryDate(undefined)
      setImageUrl(defaultVoucherImage)
    }
    setImageFile(null)
  }, [voucher, isOpen])

  const generateVoucherCode = () => {
    return `YTL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!code || !expiryDate || !value || parseFloat(value) <= 0) {
      toast({
        title: "Faltan datos",
        description: "Por favor, completa código, valor y fecha de vencimiento.",
        variant: "destructive"
      })
      return
    }

    // In a real app, you would upload the imageFile if it exists and use the returned URL.
    // For this demo, we'll just use the local preview URL (`imageUrl`).
    onSave({
      id: voucher?.id || "",
      code,
      value: parseFloat(value),
      expiryDate,
      status: voucher?.status || "Activo",
      imageUrl: imageUrl,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{voucher ? "Editar Voucher" : "Crear Nuevo Voucher"}</DialogTitle>
          <DialogDescription>
            {voucher ? "Modifica los detalles del voucher." : "Completa los detalles y previsualiza cómo se verá la Gift Card."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Form Fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Código del Voucher</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor ($)</Label>
              <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ej: 25000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
              <DatePicker date={expiryDate} setDate={setExpiryDate} className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="imageUpload">Imagen de Fondo (Opcional)</Label>
                <Input 
                  id="imageUpload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="file:text-primary-foreground file:font-bold file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-primary hover:file:bg-primary/90"
                />
            </div>
             <Button onClick={generateVoucherCode} variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Generar nuevo código
            </Button>
          </div>

          {/* Voucher Preview */}
          <div className="space-y-4">
            <Label>Vista Previa</Label>
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
                    <h3 className="font-headline text-2xl">GIFT CARD</h3>
                    <Gift className="w-8 h-8"/>
                </div>
                <div className="relative z-10 text-right">
                    <p className="font-mono text-2xl tracking-widest">{code || 'YTL-XXXXXXXX'}</p>
                    <p className="text-4xl font-bold mt-2">${value ? parseFloat(value).toLocaleString('es-AR') : '0'}</p>
                    <p className="text-xs opacity-80 mt-2">
                        Válido hasta: {expiryDate ? format(expiryDate, "dd/MM/yyyy", { locale: es }) : 'dd/mm/aaaa'}
                    </p>
                </div>
            </div>
          </div>
        </div>
        <DialogFooter>
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
