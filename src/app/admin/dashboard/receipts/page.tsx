
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Receipt as ReceiptIcon, Printer } from "lucide-react"
import { mockTours, mockReservations, mockPassengers } from "@/lib/mock-data"
import type { Tour, Reservation, Passenger } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Receipt } from "@/components/admin/receipt"
import { useReactToPrint } from 'react-to-print';
import { SearchableSelect } from "@/components/searchable-select"


export default function ReceiptsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string>("");
  const [isClient, setIsClient] = useState(false)
  const receiptRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });
  
  useEffect(() => {
    setIsClient(true);
    const storedReservations = localStorage.getItem("ytl_reservations");
    const storedTours = localStorage.getItem("ytl_tours");
    const storedPassengers = localStorage.getItem("ytl_passengers");

    setReservations(storedReservations ? JSON.parse(storedReservations) : mockReservations);
    setTours(storedTours ? JSON.parse(storedTours, (key, value) => key === 'date' ? new Date(value) : value) : mockTours);
    setPassengers(storedPassengers ? JSON.parse(storedPassengers) : mockPassengers);

    const handleStorageChange = () => {
        const newStoredReservations = localStorage.getItem("ytl_reservations");
        const newStoredTours = localStorage.getItem("ytl_tours");
        const newStoredPassengers = localStorage.getItem("ytl_passengers");
        setReservations(newStoredReservations ? JSON.parse(newStoredReservations) : mockReservations);
        setTours(newStoredTours ? JSON.parse(newStoredTours, (key, value) => key === 'date' ? new Date(value) : value) : mockTours);
        setPassengers(newStoredPassengers ? JSON.parse(newStoredPassengers) : mockPassengers);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const activeTours = useMemo(() => {
    const reservationTripIds = new Set(reservations.map(r => r.tripId));
    return tours.filter(t => reservationTripIds.has(t.id));
  }, [tours, reservations]);

  const reservationOptions = useMemo(() => {
    if (!selectedTripId) return [];
    
    return reservations
        .filter(r => r.tripId === selectedTripId)
        .map(res => {
            const mainPassenger = passengers.find(p => p.id === res.passengerIds[0]);
            return {
                value: res.id,
                label: `${res.passenger} (ID: ${res.id.substring(0, 8)})`,
                keywords: [mainPassenger?.dni || '']
            }
        });

  }, [reservations, selectedTripId, passengers]);
  
  const selectedReservation = useMemo(() => {
      if (!selectedReservationId) return null;
      return reservations.find(r => r.id === selectedReservationId);
  }, [reservations, selectedReservationId])


  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold">Generación de Recibos</h2>
            <p className="text-muted-foreground">
            Selecciona un viaje y una reserva para generar e imprimir un recibo.
            </p>
        </div>
        {selectedReservation && (
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4"/>
                Imprimir Recibo
            </Button>
        )}
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Selección de Reserva</CardTitle>
            <CardDescription>Elige el viaje y luego busca la reserva por nombre o DNI del pasajero.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start gap-4">
            <div className="space-y-2 w-full sm:w-1/2">
                <Label htmlFor="trip-filter">1. Selecciona un Viaje</Label>
                <Select onValueChange={(val) => { setSelectedTripId(val); setSelectedReservationId(""); }} value={selectedTripId || ''}>
                    <SelectTrigger id="trip-filter">
                        <SelectValue placeholder="Seleccionar viaje..." />
                    </SelectTrigger>
                    <SelectContent>
                        {activeTours.map(tour => (
                            <SelectItem key={tour.id} value={tour.id}>{tour.destination}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2 w-full sm:w-1/2">
                <Label htmlFor="reservation-filter">2. Selecciona una Reserva</Label>
                 <SearchableSelect 
                    options={reservationOptions}
                    value={selectedReservationId}
                    onChange={setSelectedReservationId}
                    placeholder="Buscar reserva por pasajero..."
                    disabled={!selectedTripId}
                />
            </div>
        </CardContent>
       </Card>

        {selectedReservation ? (
            <div className="p-4 sm:p-8 bg-gray-300 rounded-lg flex justify-center">
                <div ref={receiptRef}>
                    <Receipt reservation={selectedReservation} />
                </div>
            </div>
        ) : (
            <Card>
                <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                    <ReceiptIcon className="w-16 h-16 text-muted-foreground/50"/>
                    <p className="text-muted-foreground">
                        Selecciona un viaje y una reserva para ver el recibo.
                    </p>
                </CardContent>
            </Card>
        )}
    </div>
  )
}
