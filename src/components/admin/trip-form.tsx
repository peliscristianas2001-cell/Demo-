
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
import { getVehicleConfig } from "@/lib/vehicle-config"
import { PlusCircle, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TripFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (tour: Tour) => void
  tour: Tour | null
}

type VehicleEntry = {
    id: number;
    type: VehicleType | '';
    count: number | '';
}

export function TripForm({ isOpen, onOpenChange, onSave, tour }: TripFormProps) {
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState<Date | undefined>()
  const [price, setPrice] = useState<number | "">("")
  const [vehicleEntries, setVehicleEntries] = useState<VehicleEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [nextId, setNextId] = useState(1);
  const [vehicleConfig, setVehicleConfig] = useState(() => getVehicleConfig());

  const { toast } = useToast()

  useEffect(() => {
    // Update local vehicle config if it changes globally
    const handleStorageChange = () => {
      setVehicleConfig(getVehicleConfig(true));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
        if (tour) {
            setDestination(tour.destination)
            setDate(tour.date ? new Date(tour.date) : undefined)
            setPrice(tour.price || "")
            if (tour.vehicles) {
                const entries = Object.entries(tour.vehicles).map(([type, count], index) => ({
                    id: index,
                    type: type as VehicleType,
                    count: count || 1
                }));
                setVehicleEntries(entries);
                setNextId(entries.length);
            } else {
                setVehicleEntries([]);
                setNextId(1);
            }
        } else {
            // Reset form for new trip
            setDestination("")
            setDate(undefined)
            setPrice("")
            setVehicleEntries([{ id: 0, type: '', count: '' }])
            setNextId(1);
        }
        setIsLoading(false); 
    }
  }, [tour, isOpen])

  const handleAddVehicleEntry = () => {
    setVehicleEntries([...vehicleEntries, { id: nextId, type: '', count: '' }]);
    setNextId(nextId + 1);
  }

  const handleRemoveVehicleEntry = (id: number) => {
    setVehicleEntries(vehicleEntries.filter(entry => entry.id !== id));
  }
  
  const handleVehicleChange = (id: number, field: 'type' | 'count', value: string) => {
      setVehicleEntries(entries => entries.map(entry => {
          if (entry.id === id) {
              if (field === 'type') {
                  return { ...entry, type: value as VehicleType };
              }
              if (field === 'count') {
                  const count = parseInt(value, 10);
                  return { ...entry, count: isNaN(count) ? '' : count };
              }
          }
          return entry;
      }))
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

    const finalVehicles: Partial<Record<VehicleType, number>> = {};
    let hasInvalidEntry = false;

    for (const entry of vehicleEntries) {
        if (!entry.type || entry.count === '' || entry.count <= 0) {
            hasInvalidEntry = true;
            break;
        }
        if (finalVehicles[entry.type]) {
             toast({
                title: "Tipo de vehículo duplicado",
                description: `El tipo "${vehicleConfig[entry.type].name}" solo puede ser agregado una vez.`,
                variant: "destructive"
            });
            return;
        }
        finalVehicles[entry.type] = entry.count;
    }

    if (hasInvalidEntry) {
         toast({
            title: "Datos de vehículo incompletos",
            description: "Cada vehículo debe tener un tipo y una cantidad válida mayor a cero.",
            variant: "destructive"
        });
        return;
    }
    
    if (Object.keys(finalVehicles).length === 0) {
       toast({
        title: "Faltan vehículos",
        description: "Debes agregar y configurar al menos un tipo de vehículo.",
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
      vehicles: finalVehicles as Record<VehicleType, number>,
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
        
        <div className="flex-1 overflow-y-auto">
            <div className="py-4 pr-6 space-y-4">
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

                <div className="space-y-4 pt-2">
                    <Label className="text-base font-medium">Configuración de Vehículos</Label>
                    <div className="space-y-3 rounded-md border p-4">
                        {vehicleEntries.map((entry) => (
                           <div key={entry.id} className="flex items-center gap-2">
                               <Select
                                  value={entry.type}
                                  onValueChange={(value) => handleVehicleChange(entry.id, 'type', value)}
                               >
                                  <SelectTrigger>
                                      <SelectValue placeholder="Tipo de vehículo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {Object.entries(vehicleConfig).map(([key, config]) => (
                                          <SelectItem key={key} value={key}>
                                              {config.name}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                               </Select>
                               <Input
                                   type="number"
                                   min="1"
                                   placeholder="Cant."
                                   className="w-24 h-10"
                                   value={entry.count}
                                   onChange={(e) => handleVehicleChange(entry.id, 'count', e.target.value)}
                               />
                               <Button
                                   variant="ghost"
                                   size="icon"
                                   className="text-destructive hover:bg-destructive/10"
                                   onClick={() => handleRemoveVehicleEntry(entry.id)}
                                >
                                   <Trash2 className="w-4 h-4"/>
                               </Button>
                           </div>
                        ))}
                         <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleAddVehicleEntry}
                        >
                           <PlusCircle className="mr-2 h-4 w-4"/>
                           Agregar tipo de vehículo
                        </Button>
                    </div>
                </div>
            </div>
        </div>

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
