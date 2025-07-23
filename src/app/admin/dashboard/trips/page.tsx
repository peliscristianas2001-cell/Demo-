
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
import type { Tour, Reservation, VehicleType } from "@/lib/types"
import { vehicleConfig } from "@/lib/types"
import { TripForm } from "@/components/admin/trip-form"

export default function TripsPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("ytl_tours")
    const storedReservations = localStorage.getItem("ytl_reservations")
    
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
  }, [])
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("ytl_tours", JSON.stringify(tours));
    }
  }, [tours, isClient])

  const activeTours = useMemo(() => tours.filter(tour => new Date(tour.date) >= new Date()), [tours]);
  
  const getOccupiedSeatCount = (tourId: string) => {
    return reservations
        .filter(r => r.tripId === tourId)
        .reduce((acc, r) => acc + r.assignedSeats.length, 0);
  }

  const getTourCapacity = (tour: Tour) => {
    return Object.entries(tour.vehicles).reduce((total, [type, count]) => {
      const vehicle = vehicleConfig[type as VehicleType];
      return total + (vehicle.seats * (count || 0));
    }, 0);
  }

  const getVehicleCount = (tour: Tour) => {
    return Object.values(tour.vehicles).reduce((total, count) => total + (count || 0), 0);
  }

  const handleCreate = () => {
    setSelectedTour(null)
    setIsFormOpen(true)
  }

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour)
    setIsFormOpen(true)
  }

  const handleSave = (tourData: Tour) => {
    if (selectedTour) {
      // Update existing tour
      setTours(tours.map(t => t.id === tourData.id ? tourData : t))
    } else {
      // Create new tour
      setTours([...tours, { ...tourData, id: `T${Date.now()}` }])
    }
    setIsFormOpen(false)
    setSelectedTour(null)
  }

  const handleDelete = (tourId: string) => {
    setTours(tours.filter(t => t.id !== tourId))
  }

  if (!isClient) {
    return null; // Don't render server-side
  }

  return (
    <div className="space-y-6">
      <TripForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        tour={selectedTour}
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Viajes</h2>
          <p className="text-muted-foreground">
            Aquí podrás crear, editar y eliminar los viajes. Los viajes pasados se ocultan automáticamente.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Nuevo Viaje
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destino</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Asientos</TableHead>
                <TableHead>Micros</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay viajes activos.
                  </TableCell>
                </TableRow>
              ) : activeTours.map((tour) => {
                const occupiedCount = getOccupiedSeatCount(tour.id);
                const totalSeats = getTourCapacity(tour);
                const vehicleCount = getVehicleCount(tour);

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
                      <Badge variant={occupiedCount / totalSeats > 0.8 ? "destructive" : "secondary"}>
                        {occupiedCount} / {totalSeats}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicleCount}</Badge>
                    </TableCell>
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
