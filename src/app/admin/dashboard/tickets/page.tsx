
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
import type { Tour, Ticket, Seller, Reservation, Passenger, BoardingPoint } from "@/lib/types"
import { Label } from "@/components/ui/label"

export default function TicketsAdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [boardingPoints, setBoardingPoints] = useState<BoardingPoint[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("all");
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true);
    // Load all data from localStorage or mocks
    const storedReservations = localStorage.getItem("ytl_reservations");
    const storedTours = localStorage.getItem("ytl_tours");
    const storedSellers = localStorage.getItem("ytl_sellers");
    const storedPassengers = localStorage.getItem("ytl_passengers");
    const storedBoardingPoints = localStorage.getItem("ytl_boarding_points");

    setReservations(storedReservations ? JSON.parse(storedReservations) : mockReservations);
    setTours(storedTours ? JSON.parse(storedTours, (key, value) => key === 'date' ? new Date(value) : value) : mockTours);
    setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers);
    setPassengers(storedPassengers ? JSON.parse(storedPassengers) : mockPassengers);
    setBoardingPoints(storedBoardingPoints ? JSON.parse(storedBoardingPoints) : []);

    // Add storage event listeners to update state on changes from other tabs
    const handleStorageChange = () => {
        const newStoredReservations = localStorage.getItem("ytl_reservations");
        const newStoredTours = localStorage.getItem("ytl_tours");
        const newStoredSellers = localStorage.getItem("ytl_sellers");
        const newStoredPassengers = localStorage.getItem("ytl_passengers");
        const newStoredBoardingPoints = localStorage.getItem("ytl_boarding_points");
        setReservations(newStoredReservations ? JSON.parse(newStoredReservations) : mockReservations);
        setTours(newStoredTours ? JSON.parse(newStoredTours, (key, value) => key === 'date' ? new Date(value) : value) : mockTours);
        setSellers(newStoredSellers ? JSON.parse(newStoredSellers) : mockSellers);
        setPassengers(newStoredPassengers ? JSON.parse(newStoredPassengers) : mockPassengers);
        setBoardingPoints(newStoredBoardingPoints ? JSON.parse(newStoredBoardingPoints) : []);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Effect to regenerate tickets whenever underlying data changes
  useEffect(() => {
    const confirmedReservations = reservations.filter((r: Reservation) => r.status === 'Confirmado');
    
    const generatedTickets = confirmedReservations.flatMap((res: Reservation): Ticket[] => {
        if (!res.passengerIds || res.passengerIds.length === 0) return [];

        const tour = tours.find(t => t.id === res.tripId);
        // Find the main passenger from the complete passenger list
        const mainPassenger = passengers.find(p => p.id === res.passengerIds[0]);
        const boardingPoint = boardingPoints.find(bp => bp.id === res.boardingPointId);

        // If tour or main passenger is not found, we can't generate a valid ticket.
        if (!tour || !mainPassenger) {
            console.warn(`Skipping ticket for reservation ${res.id}: missing tour or main passenger.`);
            return [];
        }
        
        const ticketId = `${res.id}-TKT`;
        const qrData = { tId: ticketId, rId: res.id, pax: res.passenger, dest: tour.destination };

        return [{
            id: ticketId,
            reservationId: res.id,
            tripId: res.tripId,
            passengerName: mainPassenger.fullName, // Use the real-time name
            passengerDni: mainPassenger.dni || "N/A",
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}`,
            reservation: res,
            boardingPointId: res.boardingPointId,
        }];
    });
    setAllTickets(generatedTickets);
  }, [reservations, tours, passengers, boardingPoints]);


  const ticketsByTrip = useMemo(() => {
    const filtered = selectedTripId === "all" 
      ? allTickets 
      : allTickets.filter(ticket => ticket.tripId === selectedTripId);

    return filtered.reduce((acc, ticket) => {
      const { tripId } = ticket;
      if (!acc[tripId]) {
        acc[tripId] = [];
      }
      acc[tripId].push(ticket);
      return acc;
    }, {} as Record<string, Ticket[]>);
  }, [allTickets, selectedTripId]);
  
  const toursWithTickets = useMemo(() => {
      const tripIdsWithTickets = new Set(allTickets.map(t => t.tripId));
      return tours.filter(t => tripIdsWithTickets.has(t.id));
  }, [allTickets, tours]);


  const ticketRefs = useMemo(() => 
    allTickets.reduce((acc, ticket) => {
      acc[ticket.id] = createRef<HTMLDivElement>();
      return acc;
    }, {} as Record<string, React.RefObject<HTMLDivElement>>),
  [allTickets]);

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
      pdf.save(`Ticket_${passengerName.replace(/\s+/g, "_")}.pdf`);
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

      {Object.keys(ticketsByTrip).length === 0 ? (
        <Card>
            <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                <TicketCheck className="w-16 h-16 text-muted-foreground/50"/>
                <p className="text-muted-foreground">
                    No hay tickets para el viaje seleccionado o no hay reservas confirmadas.
                </p>
            </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={Object.keys(ticketsByTrip)}>
         {Object.entries(ticketsByTrip).map(([tripId, tripTickets]) => {
            const tour = tours.find(t => t.id === tripId);
            if (!tour) return null;

            return (
                 <AccordionItem value={tripId} key={tripId} className="border-b-0">
                    <Card>
                        <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline hover:bg-muted/50">
                            {tour.destination} ({tripTickets.length} tickets)
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                             <Accordion type="multiple" className="w-full">
                                {tripTickets.map((ticket) => {
                                    const seller = sellers.find(s => s.id === ticket.reservation.sellerId);
                                    const boardingPoint = boardingPoints.find(bp => bp.id === ticket.boardingPointId);
                                    return (
                                        <AccordionItem value={ticket.id} key={ticket.id} className="border-t">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                                                 <div className="flex items-center gap-4 text-left">
                                                    <div className="p-2 rounded-full bg-primary/10 text-primary"><User className="w-5 h-5"/></div>
                                                    <div>
                                                        <p className="font-semibold">{ticket.passengerName}</p>
                                                        <p className="text-sm text-muted-foreground">DNI: {ticket.passengerDni}</p>
                                                    </div>
                                                  </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="bg-slate-200 p-4 space-y-4 flex flex-col items-center">
                                                    <div ref={ticketRefs[ticket.id]} className="transform scale-[0.95]">
                                                        <TravelTicket ticket={ticket} tour={tour} seller={seller} boardingPoint={boardingPoint}/>
                                                    </div>
                                                    <div className="flex justify-end w-full px-4">
                                                    <Button onClick={() => handleDownload(ticket.id, ticket.passengerName)}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Descargar PDF
                                                    </Button>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                             </Accordion>
                        </AccordionContent>
                    </Card>
                 </AccordionItem>
            )
         })}
        </Accordion>
      )}
    </div>
  )
}
