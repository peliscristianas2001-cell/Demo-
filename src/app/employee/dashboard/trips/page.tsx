
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
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { mockTours, mockReservations } from "@/lib/mock-data"
import type { Tour, Reservation, LayoutItemType, LayoutCategory, TransportUnit } from "@/lib/types"
import { getLayoutConfig } from "@/lib/layout-config"
import { TripForm } from "@/components/admin/trip-form"

export default function TripsPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isClient, setIsClient] = useState(false)
  const [layoutConfig, setLayoutConfig] = useState(() => getLayoutConfig());

  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("app_tours")
    const storedReservations = localStorage.getItem("app_reservations")
    
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


  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Viajes Disponibles</h2>
          <p className="text-muted-foreground">
            Aquí podrás ver todos los viajes activos para realizar ventas.
          </p>
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
