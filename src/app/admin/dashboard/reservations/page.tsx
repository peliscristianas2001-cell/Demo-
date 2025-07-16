
"use client"

import { useState } from "react"
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
import { MoreHorizontal, CheckCircle, Clock, XCircle } from "lucide-react"

type ReservationStatus = "Confirmado" | "Pendiente" | "Cancelado";

type Reservation = {
    id: string;
    trip: string;
    passenger: string;
    seats: string;
    status: ReservationStatus;
}

// Mock data - in a real app, this would come from your database
const initialReservations: Reservation[] = [
    { id: "R001", trip: "Bariloche, Patagonia", passenger: "Juan Pérez", seats: "2", status: "Confirmado" },
    { id: "R002", trip: "Cataratas del Iguazú, Misiones", passenger: "María García", seats: "1", status: "Pendiente" },
    { id: "R003", trip: "Bariloche, Patagonia", passenger: "Carlos López", seats: "4", status: "Confirmado" },
    { id: "R004", trip: "Mendoza, Ruta del Vino", passenger: "Ana Martínez", seats: "2", status: "Cancelado" },
    { id: "R005", trip: "Cataratas del Iguazú, Misiones", passenger: "Lucía Hernández", seats: "3", status: "Confirmado" },
]

export default function ReservationsPage() {
  const [reservations, setReservations] = useState(initialReservations)

  const handleStatusChange = (reservationId: string, newStatus: ReservationStatus) => {
    setReservations(reservations.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    ))
  }

  const getStatusVariant = (status: ReservationStatus) => {
    switch (status) {
      case "Confirmado":
        return "secondary"
      case "Cancelado":
        return "destructive"
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
          Visualiza las reservas para cada viaje y gestiona los pasajeros.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
             <TableHeader>
              <TableRow>
                <TableHead>ID Reserva</TableHead>
                <TableHead>Viaje</TableHead>
                <TableHead>Pasajero Principal</TableHead>
                <TableHead>N° Asientos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {reservations.map((res) => (
                    <TableRow key={res.id}>
                        <TableCell className="font-mono">{res.id}</TableCell>
                        <TableCell>{res.trip}</TableCell>
                        <TableCell>{res.passenger}</TableCell>
                        <TableCell>{res.seats}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(res.status)}>
                              {res.status}
                            </Badge>
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
                                <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Confirmado')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirmado
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Pendiente')}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Pendiente
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Cancelado')} className="text-destructive">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelado
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
