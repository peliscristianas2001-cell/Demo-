

"use client"

import React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Ticket as TicketType, Tour, Seller, Reservation } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

interface TravelTicketProps {
  ticket: TicketType;
  tour: Tour;
  seller?: Seller;
}

const InfoBox = ({ label, value, className }: { label: string, value: string | number | undefined, className?: string }) => (
    <div className={cn("border border-foreground p-1.5", className)}>
        <p className="text-[9px] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-center">{value || "—"}</p>
    </div>
)

export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket, tour, seller }, ref) => {

  const reservation = ticket.reservation;

  const assignedButacas = reservation.assignedSeats.map(s => s.seatId).join(', ') || "Asignada por coordinador";

  return (
    <div ref={ref} className={cn(
      "bg-card text-foreground rounded-lg shadow-md overflow-hidden border flex flex-col",
      "w-[800px] p-4 font-sans"
    )}>
        <div className="flex justify-between items-start">
            <div className="w-1/4">
                <Logo/>
                <p className="text-xs mt-1">Tu Próximo destino está aquí</p>
            </div>
            <div className="w-2/4 text-center">
                <InfoBox label="Pasajeros" value={`${reservation.passenger} x ${reservation.paxCount}`}/>
            </div>
            <div className="w-1/4">
                <InfoBox label="Agencia" value="YO TE LLEVO" />
            </div>
        </div>

        <div className="flex mt-4 gap-4">
            <div className="w-1/4 flex flex-col gap-4">
                <InfoBox label="Vendedor/a" value={seller?.name}/>
                <InfoBox label="Cantidad" value={`${reservation.paxCount} PAX`}/>
            </div>
            <div className="w-3/4 flex flex-col justify-between text-xs p-2 border border-foreground">
               <p>{tour.cancellationPolicy || "Política de cancelación no especificada."}</p>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
            <InfoBox label="Origen" value={tour.origin}/>
            <InfoBox label="Destino" value={tour.destination}/>
            <InfoBox label="Fecha de Salida" value={format(new Date(tour.date), "dd/MM/yyyy", { locale: es })}/>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
             <div className="col-span-2 grid grid-cols-2 gap-4">
                <InfoBox label="Cantidad de Noches" value={tour.nights} />
                <InfoBox label="Tipo Habitación" value={tour.roomType} />
             </div>
             <div className="col-span-1">
                <InfoBox label="Regimen de Comidas" value={tour.pension?.type || "No incluye"} />
             </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-4">
            <InfoBox label="Bus" value={tour.bus} />
            <InfoBox label="Embarque" value={tour.departurePoint} />
            <InfoBox label="Plataforma" value={tour.platform}/>
            <InfoBox label="Butacas" value={assignedButacas}/>
        </div>
        
         <div className="grid grid-cols-4 gap-4 mt-4">
            <div/>
            <div/>
            <InfoBox label="Hora de Presentación" value={tour.presentationTime ? `${tour.presentationTime} AM` : undefined}/>
            <InfoBox label="Hora de Salida" value={tour.departureTime ? `${tour.departureTime} AM`: undefined}/>
        </div>

        <div className="mt-4">
            <InfoBox label="Observaciones" value={tour.observations}/>
        </div>
        
        <div className="mt-4 text-center border border-foreground p-2">
            <p className="font-bold text-lg">IMPORTANTE PUNTUALIDAD CON LOS HORARIOS</p>
        </div>
        
        <div className="mt-4 text-left border border-foreground p-2">
             <p className="font-bold">COORDINADOR: {tour.coordinator || "No asignado"}</p>
             <p className="font-bold">TEL: {tour.coordinatorPhone || "No asignado"}</p>
        </div>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
