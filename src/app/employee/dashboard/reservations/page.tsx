
"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { mockTours, mockReservations, mockSellers } from "@/lib/mock-data"
import type { Tour, Reservation, ReservationStatus, Seller, PaymentStatus } from "@/lib/types"

export default function EmployeeReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tours, setTours] = useState<Tour[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    const storedReservations = localStorage.getItem("ytl_reservations")
    const storedTours = localStorage.getItem("ytl_tours")
    const storedSellers = localStorage.getItem("ytl_sellers")
    
    setReservations(storedReservations ? JSON.parse(storedReservations) : mockReservations)
    setTours(storedTours ? JSON.parse(storedTours) : mockTours)
    setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers)
  }, [])

  const activeTours = useMemo(() => tours.filter(t => new Date(t.date) >= new Date()), [tours]);
  
  const reservationsByTrip = useMemo(() => {
    return activeTours.reduce((acc, tour) => {
        const tripReservations = reservations.filter(res => res.tripId === tour.id);
        if (tripReservations.length > 0) {
            acc[tour.id] = {
                tour,
                reservations: tripReservations
            };
        }
        return acc;
    }, {} as Record<string, { tour: Tour, reservations: Reservation[] }>);
  }, [reservations, activeTours]);

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

   const getPaymentStatusVariant = (status?: PaymentStatus) => {
    switch (status) {
      case "Pagado":
        return "secondary";
      case "Parcial":
        return "outline";
      case "Pendiente":
        return "destructive";
      default:
        return "default";
    }
  };

  if (!isClient) {
    return null; 
  }
  
   if (Object.keys(reservationsByTrip).length === 0) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold">Reservas</h2>
            <p className="text-muted-foreground mb-4">Aquí verás todas las reservas del sistema.</p>
            <Card>
                <CardContent className="pt-12 pb-12">
                    <p className="mb-4">No hay reservas cargadas en viajes activos.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold">Gestión de Reservas</h2>
        <p className="text-muted-foreground">
          Aquí verás todas las reservas generadas para los viajes activos.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
            <Accordion type="multiple" className="w-full" defaultValue={Object.keys(reservationsByTrip)}>
                {Object.values(reservationsByTrip).map(({ tour, reservations: tripReservations }) => (
                   <AccordionItem value={tour.id} key={tour.id}>
                       <AccordionTrigger className="text-lg font-medium hover:no-underline">
                           {tour.destination} ({tripReservations.length} reservas)
                        </AccordionTrigger>
                       <AccordionContent>
                           <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Pasajero</TableHead>
                                    <TableHead>Vendedor/a</TableHead>
                                    <TableHead>Asientos</TableHead>
                                    <TableHead>Pago</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tripReservations.map((res) => {
                                        const assignedCount = (res.assignedSeats?.length || 0) + (res.assignedCabins?.length || 0);
                                        const seller = sellers.find(s => s.id === res.sellerId);
                                        return (
                                            <TableRow key={res.id}>
                                                <TableCell>{res.passenger}</TableCell>
                                                <TableCell>{seller?.name || <Badge variant="outline">Sin Asignar</Badge>}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{assignedCount} / {res.paxCount}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getPaymentStatusVariant(res.paymentStatus)}>
                                                      {res.paymentStatus || "Pendiente"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(res.status)}>
                                                    {res.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                       </AccordionContent>
                   </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
