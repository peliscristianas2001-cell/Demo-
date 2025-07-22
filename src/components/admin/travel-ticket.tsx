
"use client"

import React from "react"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Logo } from "@/components/logo"
import type { Ticket as TicketType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TravelTicketProps {
  ticket: TicketType;
}

export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket }, ref) => {
  return (
    <div ref={ref} className="p-1 bg-white">
      <div className={cn(
          "bg-card rounded-xl shadow-md overflow-hidden border flex",
          "w-[700px] h-[300px]" // Fixed size for consistent PDF generation
      )}>
        {/* Pink Vertical Bar */}
        <div className="flex flex-col items-center justify-between w-20 p-4 bg-primary text-primary-foreground">
           <div className="p-1 bg-white rounded-md">
             <Logo />
           </div>
           <div className="transform -rotate-90 whitespace-nowrap">
                <p className="text-xl font-bold tracking-widest uppercase font-headline">Pase de Abordar</p>
            </div>
            <div />
        </div>

        {/* Main Ticket Content */}
        <div className="flex-1 flex flex-col p-6 text-foreground">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold font-headline">YO TE LLEVO</h2>
                    <p className="text-sm text-muted-foreground">Boleto de Transporte</p>
                </div>
                 <div className="text-right">
                    <p className="font-semibold">ID: {ticket.id}</p>
                    <p className="text-xs text-muted-foreground">Reserva: {ticket.reservationId}</p>
                 </div>
            </div>
            
            <div className="border-t-2 border-dashed my-4"/>

            {/* Body */}
            <div className="grid grid-cols-3 gap-6 flex-1">
                <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-4">
                    <InfoItem label="Pasajero/a" value={ticket.passengerName} />
                    <InfoItem label="Documento (DNI)" value={ticket.passengerDni} />
                    <InfoItem label="Destino" value={ticket.tripDestination} />
                    <InfoItem label="Fecha y Hora de Salida" value={format(new Date(ticket.tripDate), "dd MMM yyyy, HH:mm 'hs'", { locale: es })} />
                    <InfoItem label="Asiento" value={ticket.seat.seatId} largeValue/>
                    <InfoItem label="Micro" value={String(ticket.seat.bus)} largeValue/>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center">
                     <Image 
                        src={ticket.qrCodeUrl}
                        alt="QR Code"
                        width={120}
                        height={120}
                        className="rounded-lg shadow-md bg-white p-1 border"
                        data-ai-hint="qr code"
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">Presente este código al abordar</p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-dashed my-4"/>
            <footer className="mt-auto">
                 <p className="text-xs text-muted-foreground text-center">
                    Este boleto es personal e intransferible. ¡Que tengas un excelente viaje!
                 </p>
            </footer>
        </div>
      </div>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"


interface InfoItemProps {
    label: string;
    value: string;
    largeValue?: boolean;
}

const InfoItem = ({ label, value, largeValue = false }: InfoItemProps) => (
    <div className="flex flex-col">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={cn(
          "font-bold text-foreground truncate",
          largeValue ? "text-2xl" : "text-base"
        )}>{value}</p>
    </div>
);
