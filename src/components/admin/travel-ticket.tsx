
"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Ticket as TicketType, Tour, Seller, BoardingPoint, Pension } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import Image from "next/image"
import { 
    Users, MapPin, CalendarDays, BedDouble, Utensils, Bus, Clock, Armchair, 
    FileText, Info, AlertTriangle, UserSquare, UserCircle, Building, TicketIcon, QrCode, Loader2, Plane
} from "lucide-react"

interface TravelTicketProps {
  ticket: TicketType;
  tour: Tour;
  seller?: Seller;
  boardingPoint?: BoardingPoint;
  pension?: Pension;
}

const InfoRow = ({ label, value, className }: { label: string, value?: React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-col", className)}>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-base font-semibold text-foreground break-words">{value || "—"}</span>
    </div>
)

function QRCodeDisplay({ url }: { url: string;}) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative w-full h-full min-h-[100px] min-w-[100px]">
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-100 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin"/>
                </div>
            )}
            <Image 
                src={url} 
                alt="Código QR del Ticket" 
                layout="fill"
                objectFit="contain"
                unoptimized
                className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
            />
        </div>
    );
}


export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket, tour, seller, boardingPoint, pension }, ref) => {
  const reservation = ticket.reservation;

  const assignedLocations = [
    ...(reservation.assignedSeats || []).map(s => s.seatId),
    ...(reservation.assignedCabins || []).map(c => c.cabinId)
  ].join(', ') || "A confirmar";

  const nightsAndRoom = tour.nights && tour.nights > 0 
    ? `${tour.nights} ${tour.nights > 1 ? 'noches' : 'noche'} - ${reservation.roomTypeId || 'No especificada'}`
    : "No incluye";
    
  return (
    <div ref={ref} className={cn(
      "bg-white text-black rounded-none overflow-hidden",
      "w-[794px] min-h-[1123px] p-8 font-sans flex flex-col gap-6"
    )}
    >
        {/* Header */}
        <header className="flex justify-between items-start border-b-2 border-gray-300 pb-4">
           <div className="w-24 h-auto"><Logo /></div>
           <div className="text-right">
                <h2 className="text-3xl font-bold tracking-tight text-gray-800">PASE DE ABORDO</h2>
                <p className="text-sm text-gray-500">ID Reserva: {reservation.id}</p>
           </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-5">
                <div className="bg-gray-100 rounded-xl p-4">
                    <h3 className="text-sm uppercase text-gray-500 font-semibold">Pasajero Principal</h3>
                    <p className="text-2xl font-bold text-primary">{reservation.passenger}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <InfoRow label="Destino" value={tour.destination} />
                     <InfoRow label="Salida" value={format(new Date(tour.date), "dd MMMM, yyyy", { locale: es })} />
                </div>
                 <div className="grid grid-cols-3 gap-4 border-t pt-4">
                     <InfoRow label="Transporte" value={tour.bus} />
                     <InfoRow label="Embarque" value={boardingPoint?.name} />
                     <InfoRow label="Plataforma" value={tour.platform} />
                </div>
                 <div className="grid grid-cols-3 gap-4">
                     <InfoRow label="Presentación" value={`${tour.presentationTime} hs`} />
                     <InfoRow label="Partida" value={`${tour.departureTime} hs`} />
                     <InfoRow label="Asientos" value={assignedLocations} />
                </div>
                 <div className="grid grid-cols-3 gap-4 border-t pt-4">
                     <InfoRow label="Alojamiento" value={nightsAndRoom} />
                     <InfoRow label="Pensión" value={pension?.name || "No incluida"} />
                     <InfoRow label="Cantidad" value={`${reservation.paxCount} pasajero(s)`} />
                </div>
            </div>
            {/* Stub / QR Section */}
            <div className="col-span-1 border-l-2 border-dashed border-gray-300 pl-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{tour.destination}</h3>
                    <p className="text-gray-600">{format(new Date(tour.date), "dd/MM/yy", { locale: es })}</p>
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <InfoRow label="Pasajero" value={reservation.passenger} />
                        <InfoRow label="Asientos" value={assignedLocations} className="mt-2" />
                    </div>
                </div>
                <div className="w-full aspect-square relative">
                    <QRCodeDisplay url={ticket.qrCodeUrl} />
                </div>
                <div className="text-center text-xs text-gray-500">
                    <p className="font-bold">Agencia de Viajes PRUEBA</p>
                    <p>Presente este pase al coordinador.</p>
                </div>
            </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t-2 border-gray-300 pt-4 text-xs text-gray-600 space-y-2">
           <div>
            <h4 className="font-bold uppercase mb-1">Observaciones Importantes:</h4>
            <p>{tour.observations || "Llevar DNI o Pasaporte. Ser puntual con los horarios de presentación."}</p>
           </div>
           <div>
            <h4 className="font-bold uppercase mb-1">Coordinador/a del Viaje:</h4>
            <p>{tour.coordinator || "A confirmar"} - Tel: {tour.coordinatorPhone || "A confirmar"}</p>
           </div>
        </footer>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
