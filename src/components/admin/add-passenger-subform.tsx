
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import type { Passenger } from "@/lib/types"
import { ScrollArea } from "../ui/scroll-area"

interface AddPassengerSubFormProps {
  onSave: (passengerData: Omit<Passenger, 'id'>) => void;
  onCancel?: () => void;
}

const defaultPassenger: Omit<Passenger, 'id' | 'family' | 'tierId' | 'nationality'> = {
    fullName: "",
    dni: "",
    dob: undefined,
    phone: "",
};

export function AddPassengerSubForm({ onSave, onCancel }: AddPassengerSubFormProps) {
  const [formData, setFormData] = useState(defaultPassenger);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.dni) {
      alert("Nombre y DNI son obligatorios.");
      return;
    }
    onSave({ ...formData, nationality: 'Argentina', tierId: 'adult' });
    setFormData(defaultPassenger); // Reset form after saving
  }

  return (
    <form onSubmit={handleSubmit} className="py-4 space-y-4">
      <ScrollArea className="h-72 pr-6">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="sub-fullName">Nombre Completo</Label>
                <Input id="sub-fullName" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="sub-dni">DNI</Label>
                <Input id="sub-dni" value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="sub-dob">Fecha de Nacimiento</Label>
                <DatePicker 
                    id="sub-dob" 
                    date={formData.dob} 
                    setDate={(d) => setFormData({...formData, dob: d})} 
                    className="h-10 w-full" 
                    placeholder="Seleccionar fecha..."
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 100}
                    toYear={new Date().getFullYear()}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="sub-phone">Teléfono</Label>
                <Input id="sub-phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
        </div>
      </ScrollArea>
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit">Guardar Integrante</Button>
      </div>
    </form>
  )
}
