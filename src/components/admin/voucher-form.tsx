
"use client"

import { useEffect, useState } from "react"
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

interface VoucherFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (voucher: Voucher) => void
  voucher: Voucher | null
}

export function VoucherForm({ isOpen, onOpenChange, onSave, voucher }: VoucherFormProps) {
  const [code, setCode] = useState("")
  const [value, setValue] = useState(0)
  const [expiryDate, setExpiryDate] = useState<Date | undefined>()
  const { toast } = useToast()

  useEffect(() => {
    if (voucher) {
      setCode(voucher.code)
      setValue(voucher.value)
      setExpiryDate(voucher.expiryDate)
    } else {
      // Reset form for new voucher
      setCode(generateVoucherCode())
      setValue(0)
      setExpiryDate(undefined)
    }
  }, [voucher, isOpen])

  const generateVoucherCode = () => {
    return `YTL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  }

  const handleSubmit = () => {
    if (!code || !expiryDate || value <= 0) {
      toast({
        title: "Faltan datos",
        description: "Por favor, completa todos los campos.",
        variant: "destructive"
      })
      return
    }

    onSave({
      id: voucher?.id || "",
      code,
      value,
      expiryDate,
      status: voucher?.status || "Activo",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{voucher ? "Editar Voucher" : "Crear Nuevo Voucher"}</DialogTitle>
          <DialogDescription>
            {voucher ? "Modifica los detalles del voucher." : "Completa los detalles para crear un nuevo voucher."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">Código</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">Valor ($)</Label>
            <Input id="value" type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">Vencimiento</Label>
            <DatePicker date={expiryDate} setDate={setExpiryDate} className="col-span-3 h-10" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Voucher</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
