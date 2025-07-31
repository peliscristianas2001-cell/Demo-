
"use client"

import React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Ticket as TicketType, Tour, Seller, BoardingPoint } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Building, User, Users, Map, Calendar, Bed, Utensils, Bus, Pin, DoorOpen, Clock, Armchair, FileText, AlertTriangle, Phone, UserSquare } from "lucide-react"

interface TravelTicketProps {
  ticket: TicketType;
  tour: Tour;
  seller?: Seller;
  boardingPoint?: BoardingPoint;
}

const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType, title: string }) => (
  <div className="flex items-center gap-2 mt-4 mb-2">
    <Icon className="w-5 h-5 text-primary" />
    <h3 className="text-sm font-bold uppercase tracking-wider text-primary">{title}</h3>
  </div>
);

const InfoPair = ({ label, value }: { label: string, value: string | undefined | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-semibold text-foreground">{value || "—"}</p>
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
      "bg-white text-black rounded-lg shadow-lg overflow-hidden",
      "w-[700px] p-5 font-sans break-inside-avoid border"
    )}>
      
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <Logo />
        <div className="text-right">
            <p className="text-xs font-semibold">PASE DE ABORDO</p>
            <p className="text-2xl font-bold text-primary">{tour.destination}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6">
        {/* Left Column */}
        <div>
          <SectionTitle icon={Users} title="Pasajeros"/>
          <InfoPair label="Pasajero Principal" value={`${reservation.passenger} x ${reservation.paxCount}`} />
          
          <SectionTitle icon={Building} title="Agencia"/>
          <InfoPair label="Nombre de la agencia" value="YO TE LLEVO" />

          <SectionTitle icon={Map} title="Origen y Destino"/>
          <InfoPair label="Origen" value={tour.origin} />
          <InfoPair label="Destino" value={tour.destination} />
          
          <SectionTitle icon={Calendar} title="Fecha de Salida"/>
          <InfoPair label="Fecha" value={format(new Date(tour.date), "dd/MM/yyyy", { locale: es })} />

          <SectionTitle icon={Bed} title="Noches / Habitación"/>
          <InfoPair label="Cantidad de noches / tipo de habitación" value={nightsAndRoom} />
          
          <SectionTitle icon={Utensils} title="Régimen de Comidas"/>
          <InfoPair label="Tipo de comida incluida" value={tour.pension?.active ? tour.pension.type : 'Sin pensión'} />
          
        </div>
        {/* Right Column */}
        <div>
           <SectionTitle icon={Bus} title="Datos del Transporte"/>
           <div className="grid grid-cols-2 gap-x-4">
                <InfoPair label="Bus" value={tour.bus} />
                <InfoPair label="Plataforma" value={tour.platform} />
           </div>
           <InfoPair label="Embarque" value={boardingPoint?.name} />
           
           <SectionTitle icon={Clock} title="Horario"/>
           <div className="grid grid-cols-2 gap-x-4">
               <InfoPair label="Hora de presentación" value={tour.presentationTime} />
               <InfoPair label="Hora de salida" value={tour.departureTime} />
           </div>
           
           <SectionTitle icon={Armchair} title="Butacas"/>
           <InfoPair label="Ubicación" value={assignedLocations} />

           <SectionTitle icon={UserSquare} title="Vendedor/a"/>
           <InfoPair label="Nombre" value={seller?.name || "Agencia"} />
        </div>
      </div>

       {/* Bottom Section */}
      <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
        <div>
            <SectionTitle icon={FileText} title="Condiciones"/>
            <p className="text-xs text-muted-foreground">{tour.cancellationPolicy}</p>
        </div>
         <div>
            <p className="text-xs font-bold">Observaciones: <span className="font-normal">Obligatorio llevar D.N.I.</span></p>
            {tour.observations && <p className="text-xs font-bold">Aclaraciones Adicionales: <span className="font-normal">{tour.observations}</span></p>}
        </div>
        <div className="p-2 text-center bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="font-bold text-sm text-yellow-800">IMPORTANTE: PUNTUALIDAD CON LOS HORARIOS</p>
        </div>
         <div className="grid grid-cols-2 gap-x-6 text-sm">
            <div>
                <p className="font-bold flex items-center gap-1.5"><Phone className="w-4 h-4"/> Coordinador</p>
                <p>{tour.coordinator}: {tour.coordinatorPhone}</p>
            </div>
         </div>
      </div>

    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
