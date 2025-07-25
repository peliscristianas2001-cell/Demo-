
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
import type { Passenger } from "@/lib/types"

interface PassengerFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (passenger: Passenger) => void
  passenger: Passenger | null
}

const defaultPassenger: Omit<Passenger, 'id' | 'tierId' | 'nationality'> = {
    fullName: "",
    dni: "",
    dob: undefined,
    phone: "",
    family: ""
}

export function PassengerForm({ isOpen, onOpenChange, onSave, passenger }: PassengerFormProps) {
  const [formData, setFormData] = useState(defaultPassenger);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        if (passenger) {
            setFormData({
                ...passenger,
                dob: passenger.dob ? new Date(passenger.dob) : undefined
            })
        } else {
            setFormData(defaultPassenger)
        }
    }
  }, [passenger, isOpen])


  const handleFormChange = (id: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleSubmit = () => {
    if (!formData.fullName || !formData.dni) {
      toast({ title: "Faltan datos", description: "Por favor, completa el nombre completo y el DNI.", variant: "destructive" });
      return;
    }
    
    const passengerToSave: Passenger = {
        ...(passenger || { id: '', nationality: 'Argentina', tierId: 'adult' }),
        ...formData
    }

    onSave(passengerToSave);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{passenger ? "Editar Pasajero" : "Crear Nuevo Pasajero"}</DialogTitle>
          <DialogDescription>
            {passenger ? "Modifica los datos del pasajero." : "Completa los detalles para crear un nuevo pasajero."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => handleFormChange('fullName', e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" value={formData.dni} onChange={(e) => handleFormChange('dni', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Fecha de Nacimiento</Label>
                <DatePicker id="dob" date={formData.dob} setDate={(d) => handleFormChange('dob', d)} className="h-10 w-full" placeholder="Seleccionar fecha..." />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="family">Familia</Label>
                <Input id="family" value={formData.family} onChange={(e) => handleFormChange('family', e.target.value)} placeholder="Ej: Pérez"/>
            </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
