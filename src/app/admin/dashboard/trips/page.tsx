
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, MoreHorizontal, Edit, Trash2, FileText, ShieldAlert, HelpCircle } from "lucide-react"
import { mockTours, mockReservations } from "@/lib/mock-data"
import type { Tour, Reservation, LayoutItemType, LayoutCategory, TransportUnit } from "@/lib/types"
import { getLayoutConfig } from "@/lib/layout-config"
import { TripForm } from "@/components/admin/trip-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { GuideDialog } from "@/components/admin/guide-dialog";
import { guides } from "@/lib/guides";


type GlobalTextType = 'observations' | 'cancellationPolicy' | null;
const CREATION_LIMIT = 5; // Max 5 new trips

export default function TripsPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [layoutConfig, setLayoutConfig] = useState(() => getLayoutConfig());

  const [globalTextType, setGlobalTextType] = useState<GlobalTextType>(null);
  const [globalObservations, setGlobalObservations] = useState("");
  const [globalCancellationPolicy, setGlobalCancellationPolicy] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("app_tours")
    const storedReservations = localStorage.getItem("app_reservations")
    const storedObservations = localStorage.getItem("app_global_observations");
    const storedCancellationPolicy = localStorage.getItem("app_global_cancellation_policy");

    setGlobalObservations(storedObservations || "");
    setGlobalCancellationPolicy(storedCancellationPolicy || "");
    
    if (storedTours) {
      setTours(JSON.parse(storedTours, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      }));
    } else {
      setTours(mockTours)
    }

    if (storedReservations) {
      setReservations(JSON.parse(storedReservations))
    } else {
      setReservations(mockReservations)
    }

    const handleStorageChange = () => {
      setLayoutConfig(getLayoutConfig(true));
      const newStoredTours = localStorage.getItem("app_tours")
       if (newStoredTours) {
          setTours(JSON.parse(newStoredTours, (key, value) => {
            if (key === 'date') return new Date(value);
            return value;
          }));
        }
      const newStoredObservations = localStorage.getItem("app_global_observations");
      const newStoredCancellationPolicy = localStorage.getItem("app_global_cancellation_policy");
      setGlobalObservations(newStoredObservations || "");
      setGlobalCancellationPolicy(newStoredCancellationPolicy || "");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [])
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("app_tours", JSON.stringify(tours));
    }
  }, [tours, isClient])

  const activeTours = useMemo(() => tours.filter(tour => new Date(tour.date) >= new Date()), [tours]);
  
  const isCreationLimitReached = useMemo(() => {
    return activeTours.length >= mockTours.length + CREATION_LIMIT;
  }, [activeTours]);

  const getOccupiedCount = (tourId: string) => {
    return reservations
        .filter(r => r.tripId === tourId)
        .reduce((acc, r) => acc + ((r.assignedSeats?.length || 0) + (r.assignedCabins?.length || 0)) , 0);
  }

  const getTourCapacity = (tour: Tour) => {
    if (!tour.transportUnits) return 0;
    return tour.transportUnits.reduce((total, unit) => {
      const config = layoutConfig[unit.category]?.[unit.type];
      return total + (config?.capacity || 0);
    }, 0);
  };

  const getTransportUnitsByType = (tour: Tour): Partial<Record<LayoutCategory, number>> => {
    if (!tour.transportUnits) return {};
    return tour.transportUnits.reduce((acc, unit) => {
      acc[unit.category] = (acc[unit.category] || 0) + 1;
      return acc;
    }, {} as Partial<Record<LayoutCategory, number>>);
  };

  const activeTransportTypes = useMemo(() => {
    const types = new Set<LayoutCategory>();
    activeTours.forEach(tour => {
      if (tour.transportUnits) {
        tour.transportUnits.forEach(unit => types.add(unit.category));
      }
    });
    return Array.from(types);
  }, [activeTours]);

  const handleCreate = () => {
    if (isCreationLimitReached) {
        toast({ title: "Límite alcanzado", description: `Solo puedes crear hasta ${CREATION_LIMIT} viajes nuevos en esta demo.`, variant: "destructive"});
        return;
    }
    setSelectedTour(null)
    setIsFormOpen(true)
  }

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour)
    setIsFormOpen(true)
  }

  const handleSave = (tourData: Tour) => {
    if (selectedTour) {
      setTours(tours.map(t => t.id === tourData.id ? tourData : t))
    } else {
      setTours([...tours, { ...tourData, id: `T-${Math.random().toString(36).substring(2, 11)}` }])
    }
    setIsFormOpen(false)
    setSelectedTour(null)
  }

  const handleDelete = (tourId: string) => {
    setTours(tours.filter(t => t.id !== tourId))
  }
  
  const handleSaveGlobalText = () => {
    if (globalTextType === 'observations') {
      localStorage.setItem("app_global_observations", globalObservations);
       toast({ title: "Observaciones guardadas." });
    } else if (globalTextType === 'cancellationPolicy') {
      localStorage.setItem("app_global_cancellation_policy", globalCancellationPolicy);
       toast({ title: "Política de cancelación guardada." });
    }
    window.dispatchEvent(new Event('storage'));
    setGlobalTextType(null);
  }

  if (!isClient) {
    return null;
  }
  
  const isDialogForObservations = globalTextType === 'observations';
  const currentDialogText = isDialogForObservations ? globalObservations : globalCancellationPolicy;
  const setDialogText = isDialogForObservations ? setGlobalObservations : setGlobalCancellationPolicy;

  return (
    <div className="space-y-6">
      <GuideDialog
        isOpen={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        title={guides.trips.title}
        description={guides.trips.description}
        content={guides.trips.content}
      />
      <Dialog open={!!globalTextType} onOpenChange={(open) => !open && setGlobalTextType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isDialogForObservations ? "Observaciones Globales" : "Política de Cancelación Global"}
            </DialogTitle>
            <DialogDescription>
              {isDialogForObservations 
                ? "Este texto se añadirá a todos los viajes nuevos y existentes. Ideal para información importante y recurrente."
                : "Define la política de cancelación que se aplicará a todos los viajes."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
              <Label htmlFor="global-textarea">{isDialogForObservations ? "Observaciones" : "Política de Cancelación"}</Label>
              <Textarea 
                id="global-textarea"
                value={currentDialogText}
                onChange={(e) => setDialogText(e.target.value)}
                className="h-48"
              />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGlobalTextType(null)}>Cancelar</Button>
            <Button onClick={handleSaveGlobalText}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <TripForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        tour={selectedTour}
      />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Viajes</h2>
          <p className="text-muted-foreground">
            Crea, edita y elimina los viajes. Los viajes pasados se ocultan automáticamente.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsGuideOpen(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Guía de la Sección
            </Button>
            <Button variant="outline" onClick={() => setGlobalTextType('observations')}>
              <FileText className="mr-2 h-4 w-4" /> Observaciones
            </Button>
            <Button variant="outline" onClick={() => setGlobalTextType('cancellationPolicy')}>
              <ShieldAlert className="mr-2 h-4 w-4" /> Política
            </Button>
            <Button onClick={handleCreate} disabled={isCreationLimitReached} title={isCreationLimitReached ? `Límite de ${CREATION_LIMIT} creaciones alcanzado en esta demo.` : ''}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Viaje
            </Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destino</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Asientos Totales</TableHead>
                <TableHead>Asientos Ocupados</TableHead>
                <TableHead>Asientos Disponibles</TableHead>
                {activeTransportTypes.includes('vehicles') && <TableHead>Vehículos</TableHead>}
                {activeTransportTypes.includes('airplanes') && <TableHead>Aviones</TableHead>}
                {activeTransportTypes.includes('cruises') && <TableHead>Cruceros</TableHead>}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No hay viajes activos.
                  </TableCell>
                </TableRow>
              ) : activeTours.map((tour) => {
                const occupiedCount = getOccupiedCount(tour.id);
                const totalCapacity = getTourCapacity(tour);
                const availableSeats = totalCapacity - occupiedCount;
                const unitsByType = getTransportUnitsByType(tour);

                return (
                  <TableRow key={tour.id}>
                    <TableCell className="font-medium">{tour.destination}</TableCell>
                    <TableCell>
                      {new Date(tour.date).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>${tour.price.toLocaleString("es-AR")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{totalCapacity}</Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={occupiedCount > 0 ? "secondary" : "outline"}>{occupiedCount}</Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={availableSeats > 0 ? "default" : "destructive"}>{availableSeats}</Badge>
                    </TableCell>
                    {activeTransportTypes.includes('vehicles') && <TableCell>{unitsByType.vehicles || 0}</TableCell>}
                    {activeTransportTypes.includes('airplanes') && <TableCell>{unitsByType.airplanes || 0}</TableCell>}
                    {activeTransportTypes.includes('cruises') && <TableCell>{unitsByType.cruises || 0}</TableCell>}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(tour)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(tour.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
