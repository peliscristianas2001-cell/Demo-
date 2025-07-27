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
import { useToast } from "@/hooks/use-toast"
import type { Passenger, Seller, Reservation, PaymentStatus, Tour } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddReservationFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (reservation: Reservation) => void
  tour: Tour
  passengers: Passenger[]
  sellers: Seller[]
}

const defaultReservation = {
    passengerId: "",
    paxCount: 1,
    sellerId: "unassigned",
    finalPrice: 0,
    paymentStatus: "Pendiente" as PaymentStatus
}

export function AddReservationForm({ isOpen, onOpenChange, onSave, tour, passengers, sellers }: AddReservationFormProps) {
  const [formData, setFormData] = useState(defaultReservation);
  const [openCombobox, setOpenCombobox] = useState(false)
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        setFormData({
            ...defaultReservation,
            finalPrice: tour.price // Default to base price
        });
    }
  }, [isOpen, tour])


  const handleFormChange = (id: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleSubmit = () => {
    const selectedPassenger = passengers.find(p => p.id === formData.passengerId);
    if (!selectedPassenger || formData.paxCount <= 0 || formData.finalPrice <= 0) {
      toast({ title: "Faltan datos", description: "Por favor, selecciona un pasajero y completa los campos.", variant: "destructive" });
      return;
    }
    
    const reservationToSave: Reservation = {
        id: `YTL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        tripId: tour.id,
        passenger: selectedPassenger.fullName,
        paxCount: formData.paxCount,
        assignedSeats: [],
        assignedCabins: [],
        status: 'Pendiente',
        paymentStatus: formData.paymentStatus,
        sellerId: formData.sellerId,
        finalPrice: formData.finalPrice,
    }

    onSave(reservationToSave);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Reserva a {tour.destination}</DialogTitle>
          <DialogDescription>
            Selecciona un pasajero y completa los detalles de la reserva.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="passenger">Pasajero Principal</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between">
                        {formData.passengerId ? passengers.find((p) => p.id === formData.passengerId)?.fullName : "Seleccionar pasajero..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Buscar pasajero..." />
                            <CommandEmpty>No se encontró el pasajero.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                                {passengers.map((passenger) => (
                                <CommandItem
                                    key={passenger.id}
                                    value={passenger.fullName}
                                    onSelect={() => {
                                        handleFormChange('passengerId', passenger.id)
                                        setOpenCombobox(false)
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", formData.passengerId === passenger.id ? "opacity-100" : "opacity-0")}/>
                                    {passenger.fullName}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
             <div className="space-y-2">
                <Label htmlFor="paxCount">Cantidad de Pasajeros</Label>
                <Input id="paxCount" type="number" min="1" value={formData.paxCount} onChange={(e) => handleFormChange('paxCount', parseInt(e.target.value) || 1)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="finalPrice">Precio Final (Total)</Label>
                <Input id="finalPrice" type="number" value={formData.finalPrice} onChange={(e) => handleFormChange('finalPrice', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller">Vendedor/a</Label>
               <Select
                  value={formData.sellerId}
                  onValueChange={(val) => handleFormChange('sellerId', val)}
                >
                  <SelectTrigger id="seller"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {sellers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="paymentStatus">Estado de Pago</Label>
               <Select
                  value={formData.paymentStatus}
                  onValueChange={(val: PaymentStatus) => handleFormChange('paymentStatus', val)}
                >
                  <SelectTrigger id="paymentStatus"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Parcial">Parcial</SelectItem>
                    <SelectItem value="Pagado">Pagado</SelectItem>
                  </SelectContent>
                </Select>
            </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Reserva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
