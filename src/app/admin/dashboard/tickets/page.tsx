
"use client"

import { useState, useMemo, useEffect, createRef } from "react"
import jsPDF from "jspdf"
import { toPng } from "html-to-image"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Download, TicketCheck, User, Plane } from "lucide-react"
import { TravelTicket } from "@/components/admin/travel-ticket"
import { mockTours, mockSellers, mockReservations, mockPassengers } from "@/lib/mock-data"
import type { Tour, Ticket, Seller, Reservation, Passenger } from "@/lib/types"
import { Label } from "@/components/ui/label"

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("all");
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("ytl_tours")
    const storedSellers = localStorage.getItem("ytl_sellers")
    const storedReservations = localStorage.getItem("ytl_reservations")
    const storedPassengers = localStorage.getItem("ytl_passengers")

    const currentReservations: Reservation[] = storedReservations ? JSON.parse(storedReservations) : mockReservations;
    const currentSellers: Seller[] = storedSellers ? JSON.parse(storedSellers) : mockSellers;
    const currentTours: Tour[] = storedTours ? JSON.parse(storedTours, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
    }) : mockTours;
    const currentPassengers: Passenger[] = storedPassengers ? JSON.parse(storedPassengers) : mockPassengers;
    
    setTours(currentTours);
    setSellers(currentSellers);
    setPassengers(currentPassengers);
    
    // Generate tickets from confirmed reservations
    const confirmedReservations = currentReservations.filter((r: Reservation) => r.status === 'Confirmado');
    
    const generatedTickets = confirmedReservations.flatMap((res: Reservation): Ticket[] => {
        if (!res.passengerIds || res.passengerIds.length === 0) return [];

        const tour = currentTours.find(t => t.id === res.tripId);
        const mainPassenger = currentPassengers.find(p => p.id === res.passengerIds[0]);

        if (!tour || !mainPassenger) {
            return []; // Skip ticket generation if essential data is missing
        }
        
        const ticketId = `${res.id}-TKT`;
        const qrData = { tId: ticketId, rId: res.id, pax: res.passenger, dest: tour?.destination };

        return [{
            id: ticketId,
            reservationId: res.id,
            tripId: res.tripId,
            passengerName: res.passenger,
            passengerDni: mainPassenger?.dni || "N/A",
            assignment: res.assignedSeats[0] || res.assignedCabins[0] || { seatId: "S/A", unit: 0 },
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}`,
            reservation: res,
        }];
    });
    setTickets(generatedTickets);


  }, [])

  const filteredTickets = useMemo(() => {
    if (selectedTripId === "all") return tickets;
    return tickets.filter(ticket => ticket.tripId === selectedTripId);
  }, [tickets, selectedTripId]);
  
  const toursWithTickets = useMemo(() => {
      const tripIdsWithTickets = new Set(tickets.map(t => t.tripId));
      return tours.filter(t => tripIdsWithTickets.has(t.id));
  }, [tickets, tours]);


  const ticketRefs = useMemo(() => 
    filteredTickets.reduce((acc, ticket) => {
      acc[ticket.id] = createRef<HTMLDivElement>();
      return acc;
    }, {} as Record<string, React.RefObject<HTMLDivElement>>),
  [filteredTickets]);

  const handleDownload = async (ticketId: string, passengerName: string) => {
    const ticketElement = ticketRefs[ticketId].current;
    if (!ticketElement) return;

    try {
      const dataUrl = await toPng(ticketElement, { 
        quality: 1.0, 
        pixelRatio: 2,
         style: {
            fontFamily: "'PT Sans', sans-serif",
        },
        fetchRequestInit: {
            headers: new Headers(),
            mode: 'no-cors'
        }
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [ticketElement.offsetWidth + 20, ticketElement.offsetHeight + 20]
      });
      pdf.addImage(dataUrl, 'PNG', 10, 10, ticketElement.offsetWidth, ticketElement.offsetHeight);
      pdf.save(`Ticket_${passengerName.replace(" ", "_")}.pdf`);
    } catch (error) {
      console.error('oops, something went wrong!', error);
    }
  };


  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Tickets de Viaje</h2>
        <p className="text-muted-foreground">
          Visualiza, descarga e imprime los tickets para los pasajeros con reservas confirmadas.
        </p>
      </div>

       <Card>
        <CardContent className="pt-6 flex items-center gap-4">
            <Label htmlFor="trip-filter" className="text-nowrap">Filtrar por viaje:</Label>
            <Select onValueChange={setSelectedTripId} value={selectedTripId}>
                <SelectTrigger id="trip-filter" className="w-[300px]">
                    <SelectValue placeholder="Seleccionar viaje" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los viajes</SelectItem>
                    {toursWithTickets.map(tour => (
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
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={filteredTickets.map(t => t.id)}>
          {filteredTickets.map((ticket) => {
            const tour = tours.find(t => t.id === ticket.tripId);
            const seller = sellers.find(s => s.id === ticket.reservation.sellerId);
            if (!tour) return null;
            
            return (
            <AccordionItem value={ticket.id} key={ticket.id} className="border-b-0">
              <Card className="overflow-hidden">
                <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <User className="w-5 h-5"/>
                    </div>
                    <div>
                        <p className="font-semibold">{ticket.passengerName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Plane className="w-4 h-4"/>{tour.destination}
                        </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-slate-200 p-4 space-y-4 flex flex-col items-center">
                    <div ref={ticketRefs[ticket.id]} className="transform scale-[0.95]">
                        <TravelTicket ticket={ticket} tour={tour} seller={seller}/>
                    </div>
                    <div className="flex justify-end w-full px-4">
                      <Button onClick={() => handleDownload(ticket.id, ticket.passengerName)}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          )})}
        </Accordion>
      )}
    </div>
  )
}
