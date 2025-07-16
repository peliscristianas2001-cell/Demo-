
"use client"

import { useState, useMemo } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SeatSelector } from "@/components/booking/seat-selector"
import { MoreHorizontal, CheckCircle, Clock, Trash2, Armchair } from "lucide-react"
import { mockTours } from "@/lib/mock-data"
import type { Tour } from "@/lib/types"

type ReservationStatus = "Confirmado" | "Pendiente";

type Reservation = {
    id: string;
    tripId: string;
    tripDestination: string;
    passenger: string;
    seatsCount: number;
    assignedSeats: string[];
    status: ReservationStatus;
}

// Mock data - in a real app, this would come from your database
const initialReservations: Reservation[] = [
    { id: "R001", tripId: "1", tripDestination: "Bariloche, Patagonia", passenger: "Juan Pérez", seatsCount: 2, assignedSeats: [], status: "Confirmado" },
    { id: "R002", tripId: "2", tripDestination: "Cataratas del Iguazú, Misiones", passenger: "María García", seatsCount: 1, assignedSeats: ["7A"], status: "Pendiente" },
    { id: "R003", tripId: "1", tripDestination: "Bariloche, Patagonia", passenger: "Carlos López", seatsCount: 4, assignedSeats: [], status: "Confirmado" },
    { id: "R004", tripId: "3", tripDestination: "Mendoza, Ruta del Vino", passenger: "Ana Martínez", seatsCount: 2, assignedSeats: ["9A", "9B"], status: "Pendiente" },
    { id: "R005", tripId: "2", tripDestination: "Cataratas del Iguazú, Misiones", passenger: "Lucía Hernández", seatsCount: 3, assignedSeats: ["3B", "3C", "3D"], status: "Confirmado" },
]

export default function ReservationsPage() {
  const [reservations, setReservations] = useState(initialReservations)
  const [tours, setTours] = useState(mockTours);

  const activeTours = useMemo(() => tours.filter(t => new Date(t.date) >= new Date()), [tours]);
  
  // Filter reservations to only show those for active tours
  const activeReservations = useMemo(() => 
      reservations.filter(res => activeTours.some(tour => tour.id === res.tripId))
  , [reservations, activeTours]);


  const handleStatusChange = (reservationId: string, newStatus: ReservationStatus) => {
    setReservations(reservations.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    ))
  }

  const handleDelete = (reservationId: string) => {
    setReservations(reservations.filter(res => res.id !== reservationId));
  }

  const handleSeatSelect = (reservationId: string, seatId: string) => {
    setReservations(prevReservations => {
        return prevReservations.map(res => {
            if (res.id === reservationId) {
                const tour = tours.find(t => t.id === res.tripId);
                if (!tour) return res;

                let newAssignedSeats = [...res.assignedSeats];
                if (newAssignedSeats.includes(seatId)) {
                    // Deselect seat
                    newAssignedSeats = newAssignedSeats.filter(s => s !== seatId);
                } else {
                    // Select seat if not exceeding count
                    if (newAssignedSeats.length < res.seatsCount) {
                        newAssignedSeats.push(seatId);
                    }
                }
                return { ...res, assignedSeats: newAssignedSeats };
            }
            return res;
        });
    });
};


  const getStatusVariant = (status: ReservationStatus) => {
    switch (status) {
      case "Confirmado":
        return "secondary"
      case "Pendiente":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold">Gestión de Reservas</h2>
        <p className="text-muted-foreground">
          Visualiza las reservas para cada viaje, asigna asientos y gestiona los estados.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
             <TableHeader>
              <TableRow>
                <TableHead>Viaje</TableHead>
                <TableHead>Pasajero Principal</TableHead>
                <TableHead>Asientos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {activeReservations.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No hay reservas activas.
                        </TableCell>
                    </TableRow>
                ) : activeReservations.map((res) => {
                    const tour = tours.find(t => t.id === res.tripId);
                    if (!tour) return null; // Should not happen with filtered reservations

                    return (
                        <TableRow key={res.id}>
                            <TableCell>{res.tripDestination}</TableCell>
                            <TableCell>{res.passenger}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{res.assignedSeats.length} / {res.seatsCount}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(res.status)}>
                                  {res.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <div className="flex items-center justify-end gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Armchair className="mr-2 h-4 w-4" /> Asignar Asientos
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                                        <DialogHeader>
                                            <DialogTitle>Asignar asientos para {res.passenger}</DialogTitle>
                                            <DialogDescription>
                                                Viaje a {res.tripDestination}. Reservó {res.seatsCount} asiento(s).
                                                Selecciona su/s lugar/es en el mapa.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ScrollArea className="flex-grow">
                                            <SeatSelector
                                                totalSeats={tour.totalSeats}
                                                occupiedSeats={tour.occupiedSeats}
                                                selectedSeats={res.assignedSeats}
                                                onSeatSelect={(seatId) => handleSeatSelect(res.id, seatId)}
                                                passengerSeats={[]} // Not needed here as we are assigning
                                            />
                                        </ScrollArea>
                                         <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button">Cerrar</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Abrir menú</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Confirmado')}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Confirmar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Pendiente')}>
                                      <Clock className="mr-2 h-4 w-4" />
                                      Marcar como Pendiente
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDelete(res.id)} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                               </div>
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
