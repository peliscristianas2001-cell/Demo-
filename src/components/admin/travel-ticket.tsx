
"use client"

import React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Ticket as TicketType, Tour, Seller, BoardingPoint } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

interface TravelTicketProps {
  ticket: TicketType;
  tour: Tour;
  seller?: Seller;
  boardingPoint?: BoardingPoint;
}

const InfoBox = ({ label, value, className, labelClassName, valueClassName }: { label: string, value?: React.ReactNode, className?: string, labelClassName?: string, valueClassName?: string }) => (
    <div className={cn("border border-black p-1 text-center", className)}>
        <p className={cn("text-xs font-bold uppercase", labelClassName)}>{label}</p>
        <div className={cn("font-semibold text-sm h-6 flex items-center justify-center", valueClassName)}>
            {value || "—"}
        </div>
    </div>
);

export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket, tour, seller, boardingPoint }, ref) => {
  const reservation = ticket.reservation;
  const assignedLocations = [
    ...(reservation.assignedSeats || []).map(s => `Asiento ${s.seatId}`),
    ...(reservation.assignedCabins || []).map(c => c.cabinId)
  ].join(', ') || "Asignada por coordinador";

  const nightsAndRoom = tour.nights && tour.nights > 0 
    ? `${tour.nights} ${tour.nights > 1 ? 'noches' : 'noche'} - ${tour.roomType || ''}`
    : "Solo ida";


  return (
    <div ref={ref} className={cn(
      "bg-white text-black rounded-sm overflow-hidden",
      "w-[794px] h-[1123px] p-4 font-sans border-2 border-black flex flex-col"
    )}>
        <div className="grid grid-cols-12 gap-2 flex-grow">
            {/* Columna Izquierda */}
            <div className="col-span-3 space-y-2 flex flex-col">
                <div className="flex-shrink-0">
                    <Logo />
                </div>
                <InfoBox label="Vendedor/a" value={seller?.name} />
                <InfoBox label="Cantidad" value={`${reservation.paxCount} PAX`} />
                <div className="grid grid-cols-1 gap-2 flex-grow">
                    <InfoBox label="BUS" value={tour.bus} />
                    <InfoBox label="EMBARQUE" value={boardingPoint?.name} />
                </div>
            </div>

            {/* Columna Derecha */}
            <div className="col-span-9 grid grid-rows-6 gap-2">
                <div className="row-span-1 grid grid-cols-3 gap-2">
                    <InfoBox label="PASAJEROS" value={`${reservation.passenger} x ${reservation.paxCount}`} className="col-span-2" />
                    <InfoBox label="AGENCIA" value="YO TE LLEVO" />
                </div>
                 <div className="row-span-4 grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                        <div className="border border-black p-1 h-full">
                           <p className="text-xs text-center text-gray-600">En caso de no abordar el micro el día y hora establecida, se perderá el 100% del servicio contratado. En caso de suspender el viaje se deberá dar aviso 72 horas ANTES hábiles, caso contrario no se procederá a la reprogramación.</p>
                        </div>
                    </div>
                     <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                            <InfoBox label="ORIGEN" value={tour.origin} />
                            <InfoBox label="DESTINO" value={tour.destination} />
                        </div>
                        <InfoBox label="FECHA DE SALIDA" value={format(new Date(tour.date), "dd/MM/yyyy", { locale: es })} />
                        <div className="grid grid-cols-2 gap-2">
                            <InfoBox label="CANTIDAD DE NOCHES" value={tour.nights ? `${tour.nights}` : 'Solo ida'} />
                            <InfoBox label="HABITACION" value={tour.roomType} />
                        </div>
                         <div className="grid grid-cols-2 gap-2">
                            <InfoBox label="REGIMEN DE COMIDAS" value={tour.pension?.active ? tour.pension.type : 'Sin pensión'} />
                            <InfoBox label="PLATAFORMA" value={tour.platform} />
                        </div>
                    </div>
                 </div>
                 <div className="row-span-1 grid grid-cols-3 gap-2">
                    <InfoBox label="HORA DE PRESENTACION" value={tour.presentationTime} />
                    <InfoBox label="HORA DE SALIDA" value={tour.departureTime} />
                    <InfoBox label="BUTACAS" value={assignedLocations} />
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="space-y-1 mt-2">
             <InfoBox label="OBSERVACIONES" value="Obligatorio llevar D.N.I." className="text-left" labelClassName="text-left" valueClassName="justify-start"/>
             <InfoBox label="IMPORTANTE" value="PUNTUALIDAD CON LOS HORARIOS" className="text-left bg-gray-200" labelClassName="text-left" valueClassName="justify-start"/>
             <InfoBox label="COORDINADOR" value={`${tour.coordinator || ''} TEL: ${tour.coordinatorPhone || ''}`} className="text-left" labelClassName="text-left" valueClassName="justify-start"/>
        </div>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
