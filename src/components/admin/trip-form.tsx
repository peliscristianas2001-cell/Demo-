
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
  const [price, setPrice] = useState<number | "">("")
  const [vehicles, setVehicles] = useState<Partial<Record<VehicleType, number | undefined>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
        if (tour) {
            setDestination(tour.destination)
            setDate(tour.date ? new Date(tour.date) : undefined)
            setPrice(tour.price || "")
            setVehicles(tour.vehicles || {})
            setFlyerPreviewUrl(tour.flyerUrl)
        } else {
            // Reset form for new trip
            setDestination("")
            setDate(undefined)
            setPrice("")
            setVehicles({})
            setFlyerPreviewUrl(null)
        }
        setIsLoading(false); // Reset loading state when dialog opens/changes
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

  const handleVehicleCountChange = (type: VehicleType, countStr: string) => {
    const newVehicles = { ...vehicles };
    const count = parseInt(countStr);
    
    if (!isNaN(count) && count > 0) {
        newVehicles[type] = count;
    } else {
        // Allow clearing the input, but treat it as if count is not set for validation
        newVehicles[type] = undefined;
    }
    setVehicles(newVehicles);
  }

  const handleSubmit = () => {
    if (!destination || !date || price === "" || price <= 0) {
      toast({
        title: "Faltan datos",
        description: "Por favor, completa destino, fecha y un precio válido.",
        variant: "destructive"
      })
      return
    }

    const finalVehicles = Object.entries(vehicles).reduce((acc, [key, value]) => {
        if (value && value > 0) {
            acc[key as VehicleType] = value;
        }
        return acc;
    }, {} as Record<VehicleType, number>);

    if (Object.keys(finalVehicles).length === 0) {
       toast({
        title: "Faltan vehículos",
        description: "Debes seleccionar y asignar una cantidad a al menos un tipo de vehículo.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true);
    
    onSave({
      id: tour?.id || "",
      destination,
      date,
      price: price,
      vehicles: finalVehicles,
      flyerUrl: tour?.flyerUrl || "https://placehold.co/400x500.png", // Keep existing or use placeholder for new
    })
    
    // setLoading(false) should be handled by onOpenChange or after onSave completes in parent
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
        <ScrollArea className="flex-grow pr-6 -mr-6">
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <DatePicker id="date" date={date} setDate={setDate} className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={price} 
                    onChange={(e) => {
                        const val = e.target.value;
                        setPrice(val === '' ? '' : parseFloat(val));
                    }} 
                    placeholder="0"
                  />
              </div>

               {flyerPreviewUrl && (
                <div className="space-y-2">
                  <Label>Flyer Actual</Label>
                  <div className="p-2 border rounded-md bg-muted w-fit">
                    <Image src={flyerPreviewUrl} alt="Vista previa del flyer" width={80} height={100} className="rounded-sm object-cover aspect-[4/5]" data-ai-hint="travel flyer"/>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                  <Label className="text-base font-medium">Configuración de Vehículos</Label>
                  <div className="space-y-3 rounded-md border p-4">
                  {vehicleTypes.map(type => (
                      <div key={type} className="flex items-center gap-4">
                          <div className="flex items-center gap-2 w-40">
                          <Checkbox 
                              id={type}
                              checked={vehicles[type] !== undefined}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
