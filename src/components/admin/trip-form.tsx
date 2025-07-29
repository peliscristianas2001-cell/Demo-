

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
import type { Tour, LayoutItemType, LayoutCategory, Insurance, Pension, PricingTier, TourCosts, ExtraCost } from "@/lib/types"
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
const defaultCosts: TourCosts = { transport: 0, hotel: 0, extras: [] };

const defaultTourData: Omit<Tour, 'id' | 'destination' | 'date' | 'price' | 'flyerUrl'> = {
    origin: "",
    nights: 0,
    roomType: "",
    departurePoint: "",
    platform: "",
    presentationTime: "",
    departureTime: "",
    bus: "",
    observations: "",
    cancellationPolicy: "",
    coordinator: "",
    coordinatorPhone: "",
    insurance: defaultInsurance,
    pension: defaultPension,
    pricingTiers: [],
    costs: defaultCosts,
    vehicles: {},
    airplanes: {},
    cruises: {}
}


export function TripForm({ isOpen, onOpenChange, onSave, tour }: TripFormProps) {
  const [formData, setFormData] = useState<Omit<Tour, 'id' | 'flyerUrl'>>({
      destination: "", date: new Date(), price: 0, ...defaultTourData
  });
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
            setFormData({
              destination: tour.destination,
              date: tour.date ? new Date(tour.date) : new Date(),
              price: tour.price || 0,
              origin: tour.origin || "",
              nights: tour.nights || 0,
              roomType: tour.roomType || "",
              departurePoint: tour.departurePoint || "",
              platform: tour.platform || "",
              presentationTime: tour.presentationTime || "",
              departureTime: tour.departureTime || "",
              bus: tour.bus || "",
              observations: tour.observations || "",
              cancellationPolicy: tour.cancellationPolicy || "",
              coordinator: tour.coordinator || "",
              coordinatorPhone: tour.coordinatorPhone || "",
              insurance: tour.insurance || defaultInsurance,
              pension: tour.pension || defaultPension,
              pricingTiers: tour.pricingTiers || [],
              costs: tour.costs || defaultCosts,
              vehicles: tour.vehicles || {},
              airplanes: tour.airplanes || {},
              cruises: tour.cruises || {},
            });
            
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
            setFormData({destination: "", date: new Date(), price: 0, ...defaultTourData});
            setLayoutEntries({ vehicles: [], airplanes: [], cruises: [] });
            setNextId(1);
        }
        setIsLoading(false); 
    }
  }, [tour, isOpen])
  
  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  }

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
    setFormData(prev => ({ ...prev, insurance: { ...prev.insurance!, [field]: value }}));
  }
  
  const handlePensionChange = (field: keyof Pension, value: any) => {
    setFormData(prev => ({ ...prev, pension: { ...prev.pension!, [field]: value }}));
  }

  const handleAddTier = () => {
      setFormData(prev => ({...prev, pricingTiers: [...(prev.pricingTiers || []), { id: `T-${Math.random().toString(36).substring(2, 9)}`, name: '', price: 0 }]}))
  }

  const handleTierChange = (id: string, field: 'name' | 'price', value: string | number) => {
    setFormData(prev => ({...prev, pricingTiers: prev.pricingTiers?.map(tier => 
        tier.id === id ? { ...tier, [field]: value } : tier
    )}));
  }

  const handleRemoveTier = (id: string) => {
    setFormData(prev => ({...prev, pricingTiers: prev.pricingTiers?.filter(tier => tier.id !== id)}));
  }
  
  const handleCostChange = (field: 'transport' | 'hotel', value: string) => {
    setFormData(prev => ({ ...prev, costs: { ...prev.costs!, [field]: parseFloat(value) || 0 }}));
  }

  const handleAddExtraCost = () => {
    setFormData(prev => ({...prev, costs: {...prev.costs, extras: [...(prev.costs?.extras || []), {id: `E-${Math.random().toString(36).substring(2, 9)}`, description: '', amount: 0}]}}));
  }

  const handleExtraCostChange = (id: string, field: 'description' | 'amount', value: string | number) => {
    setFormData(prev => ({ ...prev, costs: {...prev.costs, extras: prev.costs?.extras?.map(c => c.id === id ? {...c, [field]: value} : c)}}));
  }

  const handleRemoveExtraCost = (id: string) => {
    setFormData(prev => ({ ...prev, costs: {...prev.costs, extras: prev.costs?.extras?.filter(c => c.id !== id)}}));
  }


  const handleSubmit = () => {
    const { destination, date, price } = formData;
    if (!destination || !date || price === null || price <= 0) {
      toast({ title: "Faltan datos", description: "Por favor, completa destino, fecha y un precio válido.", variant: "destructive" });
      return;
    }

    const tourDataToSave: Tour = {
        id: tour?.id || "",
        flyerUrl: tour?.flyerUrl || "https://placehold.co/400x500.png",
        ...formData,
        insurance: formData.insurance?.active ? formData.insurance : undefined,
        pension: formData.pension?.active ? formData.pension : undefined,
        pricingTiers: (formData.pricingTiers?.length || 0) > 0 ? formData.pricingTiers : undefined,
    };

    let totalTransportUnits = 0;
    const categories: LayoutCategory[] = ['vehicles', 'airplanes', 'cruises'];
    
    // Clear previous transport data before assigning new
    tourDataToSave.vehicles = {};
    tourDataToSave.airplanes = {};
    tourDataToSave.cruises = {};


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
            }
            tourDataToSave[category] = finalCategoryLayout as Record<LayoutItemType, number>;
            totalTransportUnits += entries.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0)
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
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{tour ? "Editar Viaje" : "Crear Nuevo Viaje"}</DialogTitle>
          <DialogDescription>
            {tour ? "Modifica los detalles del viaje." : "Completa los detalles para crear un nuevo viaje."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-6">
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="destination">Destino</Label>
                    <Input id="destination" value={formData.destination} onChange={(e) => handleFormChange('destination', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <DatePicker id="date" date={formData.date} setDate={(d) => handleFormChange('date', d)} className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Precio Base (Adulto)</Label>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)} placeholder="0"/>
                </div>

                <div className="space-y-4 pt-2">
                    <Accordion type="multiple" className="w-full" defaultValue={['general', 'transport']}>
                         <AccordionItem value="general">
                            <AccordionTrigger className="text-base font-medium">Información para Tickets</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2"><Label>Origen</Label><Input value={formData.origin} onChange={(e) => handleFormChange('origin', e.target.value)} /></div>
                                  <div className="space-y-2"><Label>Noches</Label><Input type="number" value={formData.nights} onChange={(e) => handleFormChange('nights', parseInt(e.target.value) || 0)} /></div>
                                  <div className="space-y-2"><Label>Tipo Habitación</Label><Input value={formData.roomType} onChange={(e) => handleFormChange('roomType', e.target.value)} /></div>
                                  <div className="space-y-2"><Label>Bus</Label><Input value={formData.bus} onChange={(e) => handleFormChange('bus', e.target.value)} /></div>
                                  <div className="space-y-2"><Label>Punto de Embarque</Label><Input value={formData.departurePoint} onChange={(e) => handleFormChange('departurePoint', e.target.value)} /></div>
                                  <div className="space-y-2"><Label>Plataforma</Label><Input value={formData.platform} onChange={(e) => handleFormChange('platform', e.target.value)} /></div>
                                  <div className="space-y-2"><Label>Hora Presentación</Label><Input value={formData.presentationTime} onChange={(e) => handleFormChange('presentationTime', e.target.value)} placeholder="HH:MM"/></div>
                                  <div className="space-y-2"><Label>Hora Salida</Label><Input value={formData.departureTime} onChange={(e) => handleFormChange('departureTime', e.target.value)} placeholder="HH:MM"/></div>
                                  <div className="space-y-2"><Label>Coordinador</Label><Input value={formData.coordinator} onChange={(e) => handleFormChange('coordinator', e.target.value)} /></div>
                                  <div className="space-y-2"><Label>Tel. Coordinador</Label><Input value={formData.coordinatorPhone} onChange={(e) => handleFormChange('coordinatorPhone', e.target.value)} /></div>
                               </div>
                                <div className="space-y-2">
                                  <Label>Observaciones</Label>
                                  <Textarea value={formData.observations} onChange={(e) => handleFormChange('observations', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Política de Cancelación</Label>
                                  <Textarea value={formData.cancellationPolicy} onChange={(e) => handleFormChange('cancellationPolicy', e.target.value)} />
                                </div>
                            </AccordionContent>
                         </AccordionItem>
                        
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
                        
                         <AccordionItem value="costs">
                            <AccordionTrigger className="text-base font-medium">Costos del Viaje</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                               <div className="space-y-2">
                                   <Label htmlFor="cost-transport">Costo Transporte (Micro)</Label>
                                   <Input id="cost-transport" type="number" value={formData.costs?.transport || ''} onChange={(e) => handleCostChange('transport', e.target.value)} placeholder="0"/>
                               </div>
                               <div className="space-y-2">
                                   <Label htmlFor="cost-hotel">Costo Hotel</Label>
                                   <Input id="cost-hotel" type="number" value={formData.costs?.hotel || ''} onChange={(e) => handleCostChange('hotel', e.target.value)} placeholder="0"/>
                               </div>
                               <div className="space-y-4 p-4 border rounded-lg">
                                  <Label className="text-lg font-medium">Gastos Extras</Label>
                                  <div className="space-y-3">
                                    {(formData.costs?.extras || []).map(cost => (
                                       <div key={cost.id} className="flex items-center gap-2">
                                        <Input 
                                          placeholder="Descripción del gasto" 
                                          value={cost.description}
                                          onChange={e => handleExtraCostChange(cost.id, 'description', e.target.value)}
                                        />
                                        <Input 
                                          type="number" 
                                          placeholder="Monto" 
                                          value={cost.amount}
                                          onChange={e => handleExtraCostChange(cost.id, 'amount', parseFloat(e.target.value) || 0)}
                                          className="w-40"
                                        />
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveExtraCost(cost.id)}>
                                          <Trash2 className="w-4 h-4"/>
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                   <Button variant="outline" size="sm" className="mt-2" onClick={handleAddExtraCost}>
                                    <PlusCircle className="mr-2 h-4 w-4"/> Añadir Gasto
                                  </Button>
                               </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="pricing">
                            <AccordionTrigger className="text-base font-medium">Tarifas Diferenciales</AccordionTrigger>
                            <AccordionContent className="pt-4">
                                <div className="space-y-4 p-4 border rounded-lg">
                                  <Label className="text-lg font-medium">Tarifas por Pasajero</Label>
                                  <div className="space-y-3">
                                    {formData.pricingTiers?.map(tier => (
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
                                        <Switch id="insurance-active" checked={formData.insurance?.active} onCheckedChange={(c) => handleInsuranceChange('active', c)} />
                                    </div>
                                    {formData.insurance?.active && (
                                        <div className="space-y-4">
                                             <div className="space-y-2">
                                                <Label htmlFor="insurance-coverage">Cobertura</Label>
                                                <Textarea id="insurance-coverage" placeholder="Detalles de la cobertura del seguro..." value={formData.insurance.coverage} onChange={(e) => handleInsuranceChange('coverage', e.target.value)}/>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                 <div className="space-y-2">
                                                    <Label htmlFor="insurance-cost">Costo</Label>
                                                    <Input id="insurance-cost" type="number" value={formData.insurance.cost} onChange={e => handleInsuranceChange('cost', parseFloat(e.target.value) || 0)}/>
                                                </div>
                                                 <div className="space-y-2">
                                                    <Label htmlFor="insurance-minAge">Edad Mín.</Label>
                                                    <Input id="insurance-minAge" type="number" value={formData.insurance.minAge} onChange={e => handleInsuranceChange('minAge', parseInt(e.target.value) || 0)}/>
                                                </div>
                                                 <div className="space-y-2">
                                                    <Label htmlFor="insurance-maxAge">Edad Máx.</Label>
                                                    <Input id="insurance-maxAge" type="number" value={formData.insurance.maxAge} onChange={e => handleInsuranceChange('maxAge', parseInt(e.target.value) || 0)}/>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Pension Section */}
                                <div className="space-y-4 p-4 border rounded-lg">
                                     <div className="flex items-center justify-between">
                                        <Label htmlFor="pension-active" className="text-lg font-medium">Pensión</Label>
                                        <Switch id="pension-active" checked={formData.pension?.active} onCheckedChange={(c) => handlePensionChange('active', c)} />
                                    </div>
                                    {formData.pension?.active && (
                                        <div className="space-y-4">
                                             <div className="space-y-2">
                                                <Label htmlFor="pension-type">Tipo de Pensión</Label>
                                                <Select value={formData.pension.type} onValueChange={(v) => handlePensionChange('type', v)}>
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
                                                <Textarea id="pension-description" placeholder="Ej: Incluye desayuno y cena, sin bebidas." value={formData.pension.description} onChange={(e) => handlePensionChange('description', e.target.value)}/>
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
