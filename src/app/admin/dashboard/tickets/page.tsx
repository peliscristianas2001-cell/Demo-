
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Printer, TicketCheck } from "lucide-react"
import { TravelTicket } from "@/components/admin/travel-ticket"
import { mockTours, mockTickets } from "@/lib/mock-data"
import type { Tour, Ticket } from "@/lib/types"

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("all");
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("ytl_tours")
    // For this demo, tickets are derived from mock data, not stored.
    setTickets(mockTickets); 
    
    if (storedTours) {
      setTours(JSON.parse(storedTours, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      }));
    } else {
      setTours(mockTours)
    }
  }, [])

  const activeTours = useMemo(() => tours.filter(t => new Date(t.date) >= new Date()), [tours]);

  const filteredTickets = useMemo(() => {
    if (selectedTripId === "all") {
      return tickets;
    }
    return tickets.filter(ticket => ticket.tripId === selectedTripId);
  }, [tickets, selectedTripId]);

  const handlePrint = () => {
    window.print();
  }

  if (!isClient) {
    return null; // Don't render server-side
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Tickets de Viaje</h2>
          <p className="text-muted-foreground">
            Visualiza e imprime los tickets para los pasajeros con reservas confirmadas.
          </p>
        </div>
        <Button onClick={handlePrint} className="print:hidden">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Tickets
        </Button>
      </div>

       <Card className="print:hidden">
        <CardContent className="pt-6 flex items-center gap-4">
            <Label htmlFor="trip-filter" className="text-nowrap">Filtrar por viaje:</Label>
            <Select onValueChange={setSelectedTripId} value={selectedTripId}>
                <SelectTrigger id="trip-filter" className="w-[300px]">
                    <SelectValue placeholder="Seleccionar viaje" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los viajes</SelectItem>
                    {activeTours.map(tour => (
                        <SelectItem key={tour.id} value={tour.id}>{tour.destination}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardContent>
       </Card>

      {filteredTickets.length === 0 ? (
        <Card>
            <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                <TicketCheck className="w-16 h-16 text-muted-foreground/50"/>
                <p className="text-muted-foreground">
                    No hay tickets para el viaje seleccionado o no hay reservas confirmadas.
                </p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-1 print:gap-12">
            {filteredTickets.map((ticket) => (
                <TravelTicket key={ticket.id} ticket={ticket} />
            ))}
        </div>
      )}
       <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          main {
            padding: 0 !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  )
}
