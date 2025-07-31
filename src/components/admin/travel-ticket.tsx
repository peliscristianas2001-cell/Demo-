
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

const InfoSection = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={cn("border border-black/80 rounded", className)}>
        <h3 className="bg-black/80 text-white text-center font-bold text-sm py-0.5 rounded-t-sm">{title}</h3>
        <div className="p-2 text-sm">{children}</div>
    </div>
);

const InfoRow = ({ label, value }: { label: string, value?: React.ReactNode }) => (
    <div className="flex justify-between">
        <span className="font-semibold text-gray-600">{label}:</span>
        <span className="text-right font-medium text-black">{value || "—"}</span>
    </div>
)


export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket, tour, seller, boardingPoint }, ref) => {
  const reservation = ticket.reservation;
  const assignedLocations = [
    ...(reservation.assignedSeats || []).map(s => `Asiento ${s.seatId}`),
    ...(reservation.assignedCabins || []).map(c => c.cabinId)
  ].join(', ') || "Asignada por coordinador";

  const nightsAndRoom = tour.nights && tour.nights > 0 
    ? `${tour.nights} ${tour.nights > 1 ? 'noches' : 'noche'} - ${tour.roomType || 'No especificada'}`
    : "Solo ida";


  return (
    <div ref={ref} className={cn(
      "bg-white text-black rounded-sm overflow-hidden",
      "w-[794px] h-[1123px] p-6 font-sans border-2 border-black flex flex-col gap-4"
    )}>
        <header className="flex justify-between items-center border-b-2 border-black pb-2">
           <Logo />
           <div className="text-right">
                <h2 className="text-xl font-bold">PASE DE ABORDO</h2>
                <p className="text-sm text-gray-600">ID Reserva: {reservation.id}</p>
           </div>
        </header>

        <main className="grid grid-cols-12 gap-4 flex-grow">
            {/* Columna Izquierda */}
            <div className="col-span-8 space-y-3">
                 <InfoSection title="PASAJEROS">
                    <InfoRow label="Nombre Pasajero" value={reservation.passenger} />
                    <InfoRow label="Cantidad (PAX)" value={`${reservation.paxCount} persona(s)`} />
                 </InfoSection>
                 <div className="grid grid-cols-2 gap-3">
                    <InfoSection title="ORIGEN Y DESTINO">
                        <InfoRow label="Origen" value={tour.origin} />
                        <InfoRow label="Destino" value={tour.destination} />
                    </InfoSection>
                    <InfoSection title="FECHA DE SALIDA">
                        <InfoRow label="Fecha" value={format(new Date(tour.date), "dd/MM/yyyy", { locale: es })} />
                    </InfoSection>
                 </div>
                 <InfoSection title="DETALLES DEL ALOJAMIENTO">
                    <InfoRow label="Noches / Habitación" value={nightsAndRoom} />
                    <InfoRow label="Régimen de Comidas" value={tour.pension?.active ? tour.pension.type : 'Sin pensión'} />
                 </InfoSection>
                 <InfoSection title="DATOS DEL TRANSPORTE">
                    <InfoRow label="Bus" value={tour.bus} />
                    <InfoRow label="Embarque" value={boardingPoint?.name} />
                    <InfoRow label="Plataforma" value={tour.platform} />
                 </InfoSection>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoSection title="HORARIO">
                        <InfoRow label="Presentación" value={tour.presentationTime} />
                        <InfoRow label="Salida" value={tour.departureTime} />
                    </InfoSection>
                     <InfoSection title="BUTACAS">
                        <InfoRow label="Ubicación" value={assignedLocations} />
                    </InfoSection>
                  </div>
            </div>

            {/* Columna Derecha */}
            <div className="col-span-4 space-y-3">
                 <InfoSection title="AGENCIA">
                    <InfoRow label="Nombre" value="YO TE LLEVO" />
                 </InfoSection>
                 <InfoSection title="COORDINADOR/A">
                    <InfoRow label="Nombre" value={tour.coordinator} />
                    <InfoRow label="Teléfono" value={tour.coordinatorPhone} />
                 </InfoSection>
                  <InfoSection title="VENDEDOR/A">
                    <InfoRow label="Nombre" value={seller?.name} />
                 </InfoSection>
            </div>
        </main>
        
        <footer className="space-y-3 border-t-2 border-black pt-2 text-xs">
            <InfoSection title="CONDICIONES">
                <p className="text-gray-700 text-center">{tour.cancellationPolicy || "Consulte la política de cancelación."}</p>
            </InfoSection>
            <div className="grid grid-cols-2 gap-3">
                 <InfoSection title="OBSERVACIONES">
                    <p className="font-semibold text-center">{tour.observations || "Obligatorio llevar D.N.I."}</p>
                </InfoSection>
                 <InfoSection title="IMPORTANTE">
                    <p className="font-bold text-red-600 text-center">¡PUNTUALIDAD CON LOS HORARIOS!</p>
                </InfoSection>
            </div>
        </footer>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
