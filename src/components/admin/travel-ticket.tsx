
"use client"

import React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Ticket as TicketType, Tour, Seller } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Barcode } from "lucide-react"

interface TravelTicketProps {
  ticket: TicketType;
  tour: Tour;
  seller?: Seller;
}

const InfoBox = ({ label, value, className, largeValue = false }: { label: string, value: string | number | undefined, className?: string, largeValue?: boolean }) => (
    <div className={cn("bg-slate-50 border border-slate-200 rounded-md p-2 flex flex-col justify-center", className)}>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className={cn("font-bold text-center", largeValue ? "text-lg" : "text-sm")}>{value || "—"}</p>
    </div>
)

export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket, tour, seller }, ref) => {

  const reservation = ticket.reservation;
  const assignedButacas = (reservation.assignedSeats && reservation.assignedSeats.length > 0) 
    ? reservation.assignedSeats.map(s => s.seatId).join(', ') 
    : (reservation.assignedCabins && reservation.assignedCabins.length > 0)
    ? reservation.assignedCabins.map(c => c.cabinId).join(', ')
    : "A confirmar";
  
  return (
    <div ref={ref} className={cn(
      "bg-white text-black rounded-xl shadow-2xl overflow-hidden border-4 border-primary/20",
      "w-[800px] p-5 font-sans break-inside-avoid"
    )}>
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b-2 border-dashed">
            <div className="w-1/3">
                <Logo/>
            </div>
            <div className="w-2/3 text-right">
                <h1 className="text-3xl font-bold tracking-tighter text-primary">PASE DE ABORDO</h1>
                <p className="text-sm text-muted-foreground">Boarding Pass</p>
            </div>
        </div>

        {/* Main Info */}
        <div className="flex mt-4 gap-5">
            <div className="w-[70%] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <InfoBox label="Pasajero Principal" value={ticket.passengerName} className="col-span-2" />
                </div>
                 <div className="grid grid-cols-4 gap-4">
                     <InfoBox label="Cant. Pax" value={reservation.paxCount} />
                     <InfoBox label="Vendedor/a" value={seller?.name || 'A confirmar'} />
                     <InfoBox label="Origen" value={tour.origin} />
                     <InfoBox label="Noches" value={tour.nights} />
                 </div>
                 <div className="grid grid-cols-1">
                    <InfoBox label="Destino" value={tour.destination} largeValue={true} className="text-center" />
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <InfoBox label="Bus" value={tour.bus} />
                    <InfoBox label="Habitación" value={tour.roomType} />
                    <InfoBox label="Pensión" value={tour.pension?.type || "No incluye"} />
                 </div>
            </div>
            <div className="w-[30%] flex flex-col items-center justify-between p-3 border-l-2 border-dashed">
                 <img src={ticket.qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                 <div className="text-center">
                    <p className="text-xs text-muted-foreground">ID Reserva</p>
                    <p className="font-mono font-bold text-lg">{reservation.id}</p>
                 </div>
            </div>
        </div>
        
        {/* Departure Info */}
        <div className="mt-4 border-t-2 border-dashed pt-4">
            <div className="grid grid-cols-4 gap-4">
                <InfoBox label="Fecha de Salida" value={format(new Date(tour.date), "dd/MM/yyyy", { locale: es })} />
                <InfoBox label="Hora Presentación" value={tour.presentationTime ? `${tour.presentationTime} hs` : undefined} />
                <InfoBox label="Hora Salida" value={tour.departureTime ? `${tour.departureTime} hs`: undefined}/>
                <InfoBox label="Lugar de Embarque" value={tour.departurePoint}/>
            </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
            <InfoBox label="Plataforma" value={tour.platform}/>
            <InfoBox label="Butacas/Cabinas" value={assignedButacas}/>
            <div className="col-span-2">
                <InfoBox label="Coordinador/a Asignado/a" value={`${tour.coordinator || "A confirmar"} (Tel: ${tour.coordinatorPhone || "S/A"})`} />
            </div>
        </div>
        
        {/* Observations */}
        {tour.observations && (
             <div className="mt-4">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Observaciones</p>
                <div className="p-2 border rounded-md text-sm bg-slate-50">
                    {tour.observations}
                </div>
            </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center border-t-2 border-dashed pt-4">
            <p className="font-bold text-lg text-destructive">¡IMPORTANTE SER PUNTUAL CON LOS HORARIOS!</p>
            <p className="text-xs text-muted-foreground mt-1">{tour.cancellationPolicy || "Consultar política de cancelación."}</p>
        </div>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
