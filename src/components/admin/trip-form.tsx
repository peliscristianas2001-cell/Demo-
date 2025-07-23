
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
import type { Tour, VehicleType } from "@/lib/types"
import { vehicleConfig } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TripFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (tour: Tour) => void
  tour: Tour | null
}

const vehicleTypes = Object.keys(vehicleConfig) as VehicleType[];

export function TripForm({ isOpen, onOpenChange, onSave, tour }: TripFormProps) {
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState<Date | undefined>()
  const [price, setPrice] = useState("")
  const [vehicles, setVehicles] = useState<Partial<Record<VehicleType, number>>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
        if (tour) {
            setDestination(tour.destination)
            setDate(new Date(tour.date))
            setPrice(String(tour.price))
            setVehicles(tour.vehicles || {})
        } else {
            // Reset form for new trip
            setDestination("")
            setDate(undefined)
            setPrice("")
            setVehicles({})
        }
    }
  }, [tour, isOpen])

  const handleVehicleCheck = (type: VehicleType, checked: boolean) => {
    const newVehicles = { ...vehicles };
    if (checked) {
        newVehicles[type] = 1; // Default to 1 when checked
    } else {
        delete newVehicles[type];
    }
    setVehicles(newVehicles);
  }

  const handleVehicleCountChange = (type: VehicleType, count: string) => {
    const newVehicles = { ...vehicles };
    const numCount = parseInt(count);
    if (!isNaN(numCount) && numCount > 0) {
        newVehicles[type] = numCount;
    } else {
        // if user clears the input, keep it associated with the vehicle
        newVehicles[type] = undefined;
    }
     setVehicles(newVehicles);
  }

  const handleSubmit = () => {
    if (!destination || !date || !price || parseFloat(price) <= 0) {
      toast({
        title: "Faltan datos",
        description: "Por favor, completa destino, fecha y precio.",
        variant: "destructive"
      })
      return
    }

    const finalVehicles = Object.entries(vehicles).reduce((acc, [key, value]) => {
        if (value && value > 0) {
            acc[key as VehicleType] = value;
        }
        return acc;
    }, {} as Partial<Record<VehicleType, number>>);

    if (Object.keys(finalVehicles).length === 0) {
       toast({
        title: "Faltan vehículos",
        description: "Debes seleccionar y asignar una cantidad a al menos un tipo de vehículo.",
        variant: "destructive"
      })
      return
    }

    onSave({
      id: tour?.id || "",
      destination,
      date,
      price: parseFloat(price),
      vehicles: finalVehicles,
      flyerUrl: tour?.flyerUrl || "https://placehold.co/400x500.png",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{tour ? "Editar Viaje" : "Crear Nuevo Viaje"}</DialogTitle>
          <DialogDescription>
            {tour ? "Modifica los detalles del viaje." : "Completa los detalles para crear un nuevo viaje."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow">
            <div className="py-4 pr-6 space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <DatePicker date={date} setDate={setDate} className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0"/>
              </div>

              <div className="space-y-4 pt-2">
                  <Label className="text-base font-medium">Configuración de Vehículos</Label>
                  <div className="space-y-3 rounded-md border p-4">
                  {vehicleTypes.map(type => (
                      <div key={type} className="flex items-center gap-4">
                          <div className="flex items-center gap-2 w-40">
                          <Checkbox 
                              id={type}
                              checked={!!vehicles[type]}
                              onCheckedChange={(checked) => handleVehicleCheck(type, !!checked)}
                          />
                          <Label htmlFor={type} className="font-normal cursor-pointer">
                              {vehicleConfig[type].name}
                          </Label>
                          </div>
                          {vehicles[type] !== undefined && (
                          <Input 
                                  type="number"
                                  min="1"
                                  className="h-9 w-24"
                                  value={vehicles[type] || ""}
                                  placeholder="Cant."
                                  onChange={(e) => handleVehicleCountChange(type, e.target.value)}
                              />
                          )}
                      </div>
                  ))}
                  </div>
              </div>
            </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
