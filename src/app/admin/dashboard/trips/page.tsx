
"use client"

import { useMemo } from "react"
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

export default function TripsPage() {
  const activeTours = useMemo(() => mockTours.filter(tour => new Date(tour.date) >= new Date()), []);
  
  const getOccupiedSeatCount = (tourId: string) => {
    return mockReservations
        .filter(r => r.tripId === tourId)
        .reduce((acc, r) => acc + r.assignedSeats.length, 0);
  }

  const getTotalSeatCount = (tour: typeof activeTours[0]) => {
    return tour.totalSeats * tour.busCount;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Viajes</h2>
          <p className="text-muted-foreground">
            Aquí podrás crear, editar y eliminar los viajes. Los viajes pasados se ocultan automáticamente.
          </p>
        </div>
        <Button>
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
                const totalSeats = getTotalSeatCount(tour);

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
                      <Badge variant="outline">{tour.busCount}</Badge>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
