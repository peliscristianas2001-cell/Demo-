
"use client"

import React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Ticket as TicketType, Tour, Seller, BoardingPoint } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { 
    Users, MapPin, Calendar, Bed, Utensils, Bus, Clock, Armchair, FileText, 
    AlertTriangle, Phone, UserSquare, Building, TicketIcon, Info
} from "lucide-react"

interface TravelTicketProps {
  ticket: TicketType;
  tour: Tour;
  seller?: Seller;
  boardingPoint?: BoardingPoint;
}

const InfoSection = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-2">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700">{title}</h3>
        </div>
        <div className="space-y-1.5 text-sm">
            {children}
        </div>
    </div>
);

const InfoPair = ({ label, value }: { label: string, value: string | undefined | null }) => (
  <div className="flex justify-between">
    <p className="text-slate-500">{label}:</p>
    <p className="font-semibold text-slate-800 text-right">{value || "—"}</p>
  </div>
);

export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket, tour, seller, boardingPoint }, ref) => {
  const reservation = ticket.reservation;
  const assignedLocations = [
    ...(reservation.assignedSeats || []).map(s => s.seatId),
    ...(reservation.assignedCabins || []).map(c => c.cabinId)
  ].join(', ') || "Asignada por coordinador";

  const nightsAndRoom = tour.nights && tour.nights > 0 
    ? `${tour.nights} ${tour.nights > 1 ? 'noches' : 'noche'} - ${tour.roomType || 'Hab. no especificada'}`
    : "Solo ida";

  return (
    <div ref={ref} className={cn(
      "bg-white text-black rounded-lg shadow-xl overflow-hidden",
      "w-[750px] p-6 font-sans break-inside-avoid border-4 border-slate-200"
    )}>
      
      {/* Header */}
      <header className="flex justify-between items-start pb-4 border-b-2 border-slate-300 border-dashed mb-4">
        <Logo />
        <div className="text-right">
            <p className="text-sm font-semibold text-slate-600">PASE DE ABORDO</p>
            <p className="text-3xl font-bold text-primary tracking-tight">{tour.destination}</p>
            <p className="font-mono text-xs bg-slate-200 inline-block px-2 py-1 rounded mt-1">{ticket.id}</p>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
            <InfoSection title="Pasajeros" icon={Users}>
                <InfoPair label="Nombre del Pasajero" value={reservation.passenger} />
                <InfoPair label="Cantidad de Personas (PAX)" value={`${reservation.paxCount} PAX`} />
            </InfoSection>

            <InfoSection title="Agencia" icon={Building}>
                <InfoPair label="Nombre de la agencia" value="YO TE LLEVO" />
            </InfoSection>

            <InfoSection title="Origen y Destino" icon={MapPin}>
                <InfoPair label="Origen" value={tour.origin} />
                <InfoPair label="Destino" value={tour.destination} />
            </InfoSection>

             <InfoSection title="Fecha de Salida" icon={Calendar}>
                <InfoPair label="Fecha" value={format(new Date(tour.date), "dd/MM/yyyy", { locale: es })} />
            </InfoSection>
            
            <InfoSection title="Noches / Habitación" icon={Bed}>
                <InfoPair label="Cantidad / Tipo" value={nightsAndRoom} />
            </InfoSection>

            <InfoSection title="Régimen de Comidas" icon={Utensils}>
                <InfoPair label="Tipo de comida incluida" value={tour.pension?.active ? tour.pension.type : 'Sin pensión'} />
            </InfoSection>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
             <InfoSection title="Datos del Transporte" icon={Bus}>
                <InfoPair label="Bus" value={tour.bus} />
                <InfoPair label="Embarque" value={boardingPoint?.name} />
                <InfoPair label="Plataforma" value={tour.platform} />
           </InfoSection>
           
           <InfoSection title="Horario" icon={Clock}>
               <InfoPair label="Hora de presentación" value={tour.presentationTime} />
               <InfoPair label="Hora de salida" value={tour.departureTime} />
           </InfoSection>
           
           <InfoSection title="Butacas" icon={Armchair}>
                <InfoPair label="Ubicación" value={assignedLocations} />
           </InfoSection>
           
           <InfoSection title="Coordinador" icon={Phone}>
                <InfoPair label="Nombre" value={tour.coordinator} />
                <InfoPair label="Teléfono" value={tour.coordinatorPhone} />
           </InfoSection>

            <InfoSection title="Vendedor/a" icon={UserSquare}>
                <InfoPair label="Nombre" value={seller?.name || "Agencia"} />
            </InfoSection>
        </div>

         {/* Full-width Sections */}
        <div className="col-span-2 space-y-4">
             <InfoSection title="Condiciones" icon={FileText}>
                <p className="text-xs text-slate-600 leading-relaxed">{tour.cancellationPolicy}</p>
            </InfoSection>
            <InfoSection title="Observaciones" icon={Info}>
                <p className="text-sm font-semibold">Obligatorio llevar D.N.I.</p>
                {tour.observations && <p className="text-xs text-slate-600 mt-1">{tour.observations}</p>}
            </InfoSection>
        </div>
      </main>

       {/* Footer */}
      <footer className="mt-4 pt-4 border-t-2 border-slate-300 border-dashed text-center">
        <div className="p-2 text-center bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="font-bold text-sm text-yellow-800 flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5"/>IMPORTANTE: PUNTUALIDAD CON LOS HORARIOS</p>
        </div>
      </footer>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
