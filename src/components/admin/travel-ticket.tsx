
"use client"

import React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Ticket as TicketType, Tour, Seller } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Barcode, Plane, User, Calendar, Clock, MapPin, BedDouble, Utensils, Shield, Armchair } from "lucide-react"

interface TravelTicketProps {
  ticket: TicketType;
  tour: Tour;
  seller?: Seller;
}

const InfoItem = ({ label, value, icon: Icon, className }: { label: string, value: string | number | undefined, icon?: React.ElementType, className?: string }) => (
    <div className={cn("flex flex-col", className)}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3"/>}
            {label}
        </p>
        <p className="font-bold text-lg text-foreground truncate">{value || "—"}</p>
    </div>
)

export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket, tour, seller }, ref) => {
  const reservation = ticket.reservation;
  const assignedLocations = [
    ...(reservation.assignedSeats || []).map(s => `Asiento ${s.seatId}`),
    ...(reservation.assignedCabins || []).map(c => `Cabina ${c.cabinId}`)
  ].join(', ') || "A confirmar";
  
  return (
    <div ref={ref} className={cn(
      "bg-white text-black rounded-2xl shadow-2xl overflow-hidden",
      "w-[800px] h-[420px] p-6 font-sans break-inside-avoid flex flex-col justify-between"
    )}>
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b-2 border-dashed border-slate-300">
            <div>
                <Logo />
                <p className="text-xs text-muted-foreground mt-1">Vendido por: {seller?.name || 'YO TE LLEVO'}</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Pase de Abordo / Boarding Pass</p>
                <h1 className="text-4xl font-extrabold tracking-tighter text-primary">{tour.destination}</h1>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 mt-4">
            {/* Left Column */}
            <div className="w-[70%] space-y-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <InfoItem label="Pasajero Principal" value={ticket.passengerName} icon={User} className="col-span-2"/>
                    <InfoItem label="Documento" value={ticket.passengerDni} />
                    <InfoItem label="Cantidad de Pasajeros" value={`${reservation.paxCount}`} />
                </div>
                 <div className="grid grid-cols-3 gap-6 pt-4 border-t border-dashed">
                    <InfoItem label="Sale de" value={tour.origin} icon={MapPin}/>
                    <InfoItem label="Fecha" value={format(new Date(tour.date), "EEE dd, MMM", { locale: es })} icon={Calendar}/>
                    <InfoItem label="Hora" value={tour.departureTime ? `${tour.departureTime} hs` : undefined} icon={Clock}/>
                 </div>
                 <div className="grid grid-cols-4 gap-6">
                    <InfoItem label="Ubicación" value={assignedLocations} icon={Armchair}/>
                    <InfoItem label="Rooming" value={tour.roomType} icon={BedDouble}/>
                    <InfoItem label="Pensión" value={tour.pension?.active ? tour.pension.type : 'No incluye'} icon={Utensils}/>
                    <InfoItem label="Seguro" value={tour.insurance?.active ? 'Incluido' : 'No incluido'} icon={Shield}/>
                 </div>
            </div>

            {/* Right Column (QR & ID) */}
            <div className="w-[30%] flex flex-col items-center justify-around p-4 border-l-2 border-dashed border-slate-300 text-center">
                 <img src={ticket.qrCodeUrl} alt="QR Code" className="w-36 h-36" />
                 <div className="w-full">
                    <p className="text-xs text-muted-foreground">ID Reserva</p>
                    <p className="font-mono font-bold text-xl tracking-wider">{reservation.id}</p>
                 </div>
                 <Barcode className="w-full h-12 text-black"/>
            </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center border-t-2 border-dashed border-slate-300 pt-3">
            <p className="font-bold text-lg text-primary">¡Gracias por viajar con nosotros!</p>
            <p className="text-xs text-muted-foreground mt-1">Presentate en {tour.departurePoint} a las {tour.presentationTime} hs. ¡No te olvides tu DNI!</p>
        </div>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
