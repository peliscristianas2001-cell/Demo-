
"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Ticket } from "lucide-react"

// Mock data - in a real app, this would come from your database
const mockReservations = [
    { id: "R001", trip: "Bariloche, Patagonia", passenger: "Juan Pérez", seats: "2", status: "Confirmado" },
    { id: "R002", trip: "Cataratas del Iguazú, Misiones", passenger: "María García", seats: "1", status: "Pendiente" },
    { id: "R003", trip: "Bariloche, Patagonia", passenger: "Carlos López", seats: "4", status: "Confirmado" },
    { id: "R004", trip: "Mendoza, Ruta del Vino", passenger: "Ana Martínez", seats: "2", status: "Cancelado" },
    { id: "R005", trip: "Cataratas del Iguazú, Misiones", passenger: "Lucía Hernández", seats: "3", status: "Confirmado" },
]

export default function ReservationsPage() {
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
              </TableRow>
            </TableHeader>
            <TableBody>
                {mockReservations.map((res) => (
                    <TableRow key={res.id}>
                        <TableCell className="font-mono">{res.id}</TableCell>
                        <TableCell>{res.trip}</TableCell>
                        <TableCell>{res.passenger}</TableCell>
                        <TableCell>{res.seats}</TableCell>
                        <TableCell>
                            <Badge variant={
                                res.status === "Confirmado" ? "secondary" : 
                                res.status === "Cancelado" ? "destructive" : "outline"
                            }>{res.status}</Badge>
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
