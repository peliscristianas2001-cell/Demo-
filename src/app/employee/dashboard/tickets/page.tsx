
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
import { mockTours, mockTickets } from "@/lib/mock-data"
import type { Tour, Ticket } from "@/lib/types"
import { Label } from "@/components/ui/label"

export default function EmployeeTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("all");
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("ytl_tours")
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
      const activeTourIds = new Set(activeTours.map(t => t.id));
      return tickets.filter(ticket => activeTourIds.has(ticket.tripId));
    }
    return tickets.filter(ticket => ticket.tripId === selectedTripId);
  }, [tickets, selectedTripId, activeTours]);

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
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        fetchRequestInit: {
            headers: new Headers(),
            mode: 'cors'
        }
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [ticketElement.offsetWidth, ticketElement.offsetHeight]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, ticketElement.offsetWidth, ticketElement.offsetHeight);
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
          Visualiza y descarga los tickets de los pasajeros con reservas confirmadas.
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
                    <SelectItem value="all">Todos los viajes activos</SelectItem>
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
        <Accordion type="multiple" className="w-full space-y-4">
          {filteredTickets.map((ticket) => {
            const tour = tours.find(t => t.id === ticket.tripId);
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
                  <div className="bg-secondary/20 p-4 space-y-4">
                    <TravelTicket ticket={ticket} tour={tour} ref={ticketRefs[ticket.id]}/>
                    <div className="flex justify-end">
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
