
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
import type { Tour, LayoutItemType, LayoutCategory } from "@/lib/types"
import { getLayoutConfig } from "@/lib/layout-config"
import { PlusCircle, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface TripFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (tour: Tour) => void
  tour: Tour | null
}

type LayoutEntry = {
    id: number;
    type: LayoutItemType | '';
    count: number | '';
}

export function TripForm({ isOpen, onOpenChange, onSave, tour }: TripFormProps) {
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState<Date | undefined>()
  const [price, setPrice] = useState<number | "">("")
  const [layoutEntries, setLayoutEntries] = useState<Record<LayoutCategory, LayoutEntry[]>>({ vehicles: [], airplanes: [], cruises: [] });
  const [isLoading, setIsLoading] = useState(false)
  const [nextId, setNextId] = useState(1);
  const [layoutConfig, setLayoutConfig] = useState(() => getLayoutConfig());
  const { toast } = useToast();

  const categoryNames: Record<LayoutCategory, string> = {
      vehicles: 'Vehículos',
      airplanes: 'Aviones',
      cruises: 'Cruceros'
  }

  useEffect(() => {
    const handleStorageChange = () => {
      setLayoutConfig(getLayoutConfig(true));
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
            
            const categories: LayoutCategory[] = ['vehicles', 'airplanes', 'cruises'];
            let currentId = 0;
            const newLayoutEntries: Record<LayoutCategory, LayoutEntry[]> = { vehicles: [], airplanes: [], cruises: [] };
            categories.forEach(cat => {
                if (tour[cat]) {
                    newLayoutEntries[cat] = Object.entries(tour[cat]!).map(([type, count]) => ({
                        id: currentId++,
                        type: type as LayoutItemType,
                        count: count || 1
                    }));
                }
            })
            setLayoutEntries(newLayoutEntries);
            setNextId(currentId);
        } else {
            // Reset form for new trip
            setDestination("");
            setDate(undefined);
            setPrice("");
            setLayoutEntries({ vehicles: [], airplanes: [], cruises: [] });
            setNextId(1);
        }
        setIsLoading(false); 
    }
  }, [tour, isOpen])

  const handleAddEntry = (category: LayoutCategory) => {
    setLayoutEntries(prev => ({
        ...prev,
        [category]: [...prev[category], { id: nextId, type: '', count: '' }]
    }));
    setNextId(nextId + 1);
  }

  const handleRemoveEntry = (category: LayoutCategory, id: number) => {
    setLayoutEntries(prev => ({
        ...prev,
        [category]: prev[category].filter(entry => entry.id !== id)
    }));
  }
  
  const handleEntryChange = (category: LayoutCategory, id: number, field: 'type' | 'count', value: string) => {
      setLayoutEntries(prev => ({
          ...prev,
          [category]: prev[category].map(entry => {
              if (entry.id === id) {
                  if (field === 'type') {
                      return { ...entry, type: value as LayoutItemType };
                  }
                  if (field === 'count') {
                      const count = parseInt(value, 10);
                      return { ...entry, count: isNaN(count) ? '' : count };
                  }
              }
              return entry;
          })
      }))
  }

  const handleSubmit = () => {
    if (!destination || !date || price === "" || price <= 0) {
      toast({ title: "Faltan datos", description: "Por favor, completa destino, fecha y un precio válido.", variant: "destructive" });
      return;
    }

    const tourDataToSave: Tour = {
        id: tour?.id || "",
        destination,
        date,
        price,
        flyerUrl: tour?.flyerUrl || "https://placehold.co/400x500.png",
    };

    let totalTransportUnits = 0;
    const categories: LayoutCategory[] = ['vehicles', 'airplanes', 'cruises'];

    for (const category of categories) {
        const entries = layoutEntries[category];
        if (entries.length > 0) {
            const finalCategoryLayout: Partial<Record<LayoutItemType, number>> = {};
            const typesInLayout = new Set<LayoutItemType>();

            for (const entry of entries) {
                if (!entry.type || entry.count === '' || entry.count <= 0) {
                    toast({ title: "Datos incompletos", description: `Cada unidad en ${categoryNames[category]} debe tener un tipo y cantidad válida.`, variant: "destructive" });
                    return;
                }
                if (typesInLayout.has(entry.type)) {
                    toast({ title: "Tipo duplicado", description: `El tipo "${layoutConfig[category][entry.type].name}" solo puede ser agregado una vez en ${categoryNames[category]}.`, variant: "destructive" });
                    return;
                }
                finalCategoryLayout[entry.type] = entry.count;
                typesInLayout.add(entry.type);
                totalTransportUnits++;
            }
            tourDataToSave[category] = finalCategoryLayout as Record<LayoutItemType, number>;
        }
    }

    if (totalTransportUnits === 0) {
       toast({ title: "Faltan unidades", description: "Debes agregar y configurar al menos una unidad de transporte (vehículo, avión o crucero).", variant: "destructive" });
       return;
    }

    setIsLoading(true);
    onSave(tourDataToSave);
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
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="0"/>
                </div>

                <div className="space-y-4 pt-2">
                    <Label className="text-base font-medium">Configuración de Transporte</Label>
                    <Accordion type="multiple" className="w-full">
                        {(Object.keys(layoutConfig) as LayoutCategory[]).map(category => (
                            <AccordionItem value={category} key={category}>
                                <AccordionTrigger>{categoryNames[category]}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3 rounded-md border p-4">
                                        {layoutEntries[category].map((entry) => (
                                           <div key={entry.id} className="flex items-center gap-2">
                                               <Select value={entry.type} onValueChange={(value) => handleEntryChange(category, entry.id, 'type', value)}>
                                                  <SelectTrigger><SelectValue placeholder="Tipo..." /></SelectTrigger>
                                                  <SelectContent>
                                                      {Object.entries(layoutConfig[category] || {}).map(([key, config]) => (
                                                          <SelectItem key={key} value={key}>{config.name}</SelectItem>
                                                      ))}
                                                  </SelectContent>
                                               </Select>
                                               <Input type="number" min="1" placeholder="Cant." className="w-24 h-10" value={entry.count} onChange={(e) => handleEntryChange(category, entry.id, 'count', e.target.value)}/>
                                               <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveEntry(category, entry.id)}>
                                                   <Trash2 className="w-4 h-4"/>
                                               </Button>
                                           </div>
                                        ))}
                                         <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAddEntry(category)}>
                                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
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
