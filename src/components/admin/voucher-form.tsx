
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
import { Gift, Sparkles, Upload, FileImage, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Logo } from "@/components/logo"
import { ScrollArea } from "@/components/ui/scroll-area"


interface VoucherFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (voucher: Voucher) => void
  voucher: Voucher | null
}

const defaultVoucherImage = "https://placehold.co/600x400.png"

export function VoucherForm({ isOpen, onOpenChange, onSave, voucher }: VoucherFormProps) {
  const [code, setCode] = useState("")
  const [value, setValue] = useState<string | number>("")
  const [quantity, setQuantity] = useState<string | number>(1);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>()
  const [imageUrl, setImageUrl] = useState(defaultVoucherImage)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [recipientName, setRecipientName] = useState("")
  const [senderName, setSenderName] = useState("")
  const [message, setMessage] = useState("")
  
  const { toast } = useToast()

  useEffect(() => {
    if (voucher) {
      setCode(voucher.code)
      setValue(voucher.value)
      setQuantity(voucher.quantity)
      setExpiryDate(voucher.expiryDate)
      setImageUrl(voucher.imageUrl || defaultVoucherImage)
      setRecipientName(voucher.recipientName || "")
      setSenderName(voucher.senderName || "")
      setMessage(voucher.message || "")
    } else {
      // Reset form for new voucher
      setCode(generateVoucherCode())
      setValue("")
      setQuantity(1)
      setExpiryDate(undefined)
      setImageUrl(defaultVoucherImage)
      setRecipientName("")
      setSenderName("YO TE LLEVO")
      setMessage("¡Válido para tu próxima gran aventura!")
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
  
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string | number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]\d*$/.test(value)) {
       setter(value);
    }
  };

  const handleSubmit = () => {
    if (!code || !expiryDate || !value || !quantity || parseFloat(String(value)) <= 0 || parseInt(String(quantity)) <= 0) {
      toast({
        title: "Faltan datos",
        description: "Por favor, completa código, valor, cantidad y fecha de vencimiento.",
        variant: "destructive"
      })
      return
    }

    onSave({
      id: voucher?.id || "",
      code,
      value: parseFloat(String(value)),
      quantity: parseInt(String(quantity)),
      expiryDate,
      status: voucher?.status || "Activo",
      imageUrl: imageUrl,
      recipientName,
      senderName,
      message,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{voucher ? "Editar Voucher" : "Crear Nuevo Voucher"}</DialogTitle>
          <DialogDescription>
            {voucher ? "Modifica los detalles del voucher." : "Completa los detalles y previsualiza cómo se verá la Gift Card."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            {/* Form Fields */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Código del Voucher</Label>
                    <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="value">Valor ($)</Label>
                      <Input id="value" type="text" value={value} onChange={handleNumericChange(setValue)} placeholder="Ej: 25000" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad</Label>
                      <Input id="quantity" type="text" value={quantity} onChange={handleNumericChange(setQuantity)} placeholder="Ej: 10" />
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                    <DatePicker date={expiryDate} setDate={setExpiryDate} className="h-10 w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="recipientName">Para (Destinatario)</Label>
                      <Input id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Nombre de quien recibe"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="senderName">De (Remitente)</Label>
                      <Input id="senderName" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Tu nombre o 'YO TE LLEVO'"/>
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Unas palabras para el agasajado..." />
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

                <Button onClick={() => setCode(generateVoucherCode())} variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar nuevo código
                </Button>
            </div>

            {/* Voucher Preview */}
            <div className="space-y-4">
              <Label>Vista Previa de la Gift Card</Label>
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
                      <div className="font-headline text-2xl tracking-wider">GIFT CARD</div>
                      <Gift className="w-8 h-8 opacity-80"/>
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                      <p className="text-sm opacity-80">Para: {recipientName || "Un Viajero/a Especial"}</p>
                      <p className="text-4xl lg:text-5xl font-bold mt-1 text-amber-300 drop-shadow-lg">${value ? parseFloat(String(value)).toLocaleString('es-AR') : '0'}</p>
                      <p className="font-mono text-lg tracking-widest mt-2 bg-black/30 px-3 py-1 rounded-md border border-white/20">{code || 'YTL-XXXXXXXX'}</p>
                      <p className="text-sm opacity-80 mt-2">De: {senderName || "YO TE LLEVO"}</p>
                  </div>
                  
                  <div className="relative z-10 text-right">
                      <p className="text-xs opacity-70">
                          Válido hasta: {expiryDate ? format(expiryDate, "dd/MM/yyyy", { locale: es }) : 'dd/mm/aaaa'}
                      </p>
                  </div>
              </div>
              <p className="text-xs text-muted-foreground text-center italic flex items-center gap-2 justify-center">
                  <MessageSquare className="w-4 h-4" />
                  Mensaje incluido: "{message}"
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
