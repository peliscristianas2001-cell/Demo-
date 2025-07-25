
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
import type { Tour, LayoutItemType, LayoutCategory, Insurance, Pension, PricingTier } from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

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

const defaultInsurance: Insurance = { active: false, coverage: '', cost: 0, minAge: 0, maxAge: 99 };
const defaultPension: Pension = { active: false, type: 'Media', description: '' };

export function TripForm({ isOpen, onOpenChange, onSave, tour }: TripFormProps) {
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState<Date | undefined>()
  const [price, setPrice] = useState<number | "">("")
  const [layoutEntries, setLayoutEntries] = useState<Record<LayoutCategory, LayoutEntry[]>>({ vehicles: [], airplanes: [], cruises: [] });
  const [insurance, setInsurance] = useState<Insurance>(defaultInsurance);
  const [pension, setPension] = useState<Pension>(defaultPension);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
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
            setInsurance(tour.insurance || defaultInsurance);
            setPension(tour.pension || defaultPension);
            setPricingTiers(tour.pricingTiers || []);
            
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
            setInsurance(defaultInsurance);
            setPension(defaultPension);
            setPricingTiers([]);
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

  const handleInsuranceChange = (field: keyof Insurance, value: any) => {
    setInsurance(prev => ({ ...prev, [field]: value }));
  }
  
  const handlePensionChange = (field: keyof Pension, value: any) => {
    setPension(prev => ({ ...prev, [field]: value }));
  }

  const handleAddTier = () => {
      setPricingTiers(prev => [...prev, { id: `T${Date.now()}`, name: '', price: 0 }]);
  }

  const handleTierChange = (id: string, field: 'name' | 'price', value: string | number) => {
    setPricingTiers(prev => prev.map(tier => 
        tier.id === id ? { ...tier, [field]: value } : tier
    ));
  }

  const handleRemoveTier = (id: string) => {
    setPricingTiers(prev => prev.filter(tier => tier.id !== id));
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
        insurance: insurance.active ? insurance : undefined,
        pension: pension.active ? pension : undefined,
        pricingTiers: pricingTiers.length > 0 ? pricingTiers : undefined,
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
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
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
                    <Label htmlFor="price">Precio Base (Adulto)</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="0"/>
                </div>

                <div className="space-y-4 pt-2">
                    <Accordion type="multiple" className="w-full" defaultValue={['transport', 'services']}>
                         <AccordionItem value="transport">
                            <AccordionTrigger className="text-base font-medium">Configuración de Transporte</AccordionTrigger>
                            <AccordionContent>
                                {(Object.keys(layoutConfig) as LayoutCategory[]).map(category => (
                                    <div key={category} className="mb-4 last:mb-0">
                                        <h4 className="font-semibold text-muted-foreground mb-2">{categoryNames[category]}</h4>
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
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="pricing">
                            <AccordionTrigger className="text-base font-medium">Tarifas Diferenciales</AccordionTrigger>
                            <AccordionContent className="pt-4">
                                <div className="space-y-4 p-4 border rounded-lg">
                                  <Label className="text-lg font-medium">Tarifas por Pasajero</Label>
                                  <div className="space-y-3">
                                    {pricingTiers.map(tier => (
                                      <div key={tier.id} className="flex items-center gap-2">
                                        <Input 
                                          placeholder="Nombre (Ej: Niño)" 
                                          value={tier.name}
                                          onChange={e => handleTierChange(tier.id, 'name', e.target.value)}
                                        />
                                        <Input 
                                          type="number" 
                                          placeholder="Precio" 
                                          value={tier.price}
                                          onChange={e => handleTierChange(tier.id, 'price', parseFloat(e.target.value) || 0)}
                                          className="w-40"
                                        />
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveTier(tier.id)}>
                                          <Trash2 className="w-4 h-4"/>
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                  <Button variant="outline" size="sm" className="mt-2" onClick={handleAddTier}>
                                    <PlusCircle className="mr-2 h-4 w-4"/> Añadir Tarifa
                                  </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="services">
                             <AccordionTrigger className="text-base font-medium">Servicios Adicionales</AccordionTrigger>
                             <AccordionContent className="space-y-6 pt-4">
                                {/* Insurance Section */}
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="insurance-active" className="text-lg font-medium">Seguro</Label>
                                        <Switch id="insurance-active" checked={insurance.active} onCheckedChange={(c) => handleInsuranceChange('active', c)} />
                                    </div>
                                    {insurance.active && (
                                        <div className="space-y-4">
                                             <div className="space-y-2">
                                                <Label htmlFor="insurance-coverage">Cobertura</Label>
                                                <Textarea id="insurance-coverage" placeholder="Detalles de la cobertura del seguro..." value={insurance.coverage} onChange={(e) => handleInsuranceChange('coverage', e.target.value)}/>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                 <div className="space-y-2">
                                                    <Label htmlFor="insurance-cost">Costo</Label>
                                                    <Input id="insurance-cost" type="number" value={insurance.cost} onChange={e => handleInsuranceChange('cost', parseFloat(e.target.value) || 0)}/>
                                                </div>
                                                 <div className="space-y-2">
                                                    <Label htmlFor="insurance-minAge">Edad Mín.</Label>
                                                    <Input id="insurance-minAge" type="number" value={insurance.minAge} onChange={e => handleInsuranceChange('minAge', parseInt(e.target.value) || 0)}/>
                                                </div>
                                                 <div className="space-y-2">
                                                    <Label htmlFor="insurance-maxAge">Edad Máx.</Label>
                                                    <Input id="insurance-maxAge" type="number" value={insurance.maxAge} onChange={e => handleInsuranceChange('maxAge', parseInt(e.target.value) || 0)}/>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Pension Section */}
                                <div className="space-y-4 p-4 border rounded-lg">
                                     <div className="flex items-center justify-between">
                                        <Label htmlFor="pension-active" className="text-lg font-medium">Pensión</Label>
                                        <Switch id="pension-active" checked={pension.active} onCheckedChange={(c) => handlePensionChange('active', c)} />
                                    </div>
                                    {pension.active && (
                                        <div className="space-y-4">
                                             <div className="space-y-2">
                                                <Label htmlFor="pension-type">Tipo de Pensión</Label>
                                                <Select value={pension.type} onValueChange={(v) => handlePensionChange('type', v)}>
                                                    <SelectTrigger id="pension-type"><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Media">Media Pensión</SelectItem>
                                                        <SelectItem value="Completa">Pensión Completa</SelectItem>
                                                        <SelectItem value="Desayuno">Solo Desayuno</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pension-description">Descripción</Label>
                                                <Textarea id="pension-description" placeholder="Ej: Incluye desayuno y cena, sin bebidas." value={pension.description} onChange={(e) => handlePensionChange('description', e.target.value)}/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             </AccordionContent>
                        </AccordionItem>
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
