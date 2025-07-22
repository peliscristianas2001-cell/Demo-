
"use client"

import React from "react"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { Ticket, User, Calendar, MapPin, Armchair, Bus, Plane } from "lucide-react"
import type { Ticket as TicketType } from "@/lib/types"
import { cn } from "@/lib/utils"


interface TravelTicketProps {
  ticket: TicketType;
}

export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket }, ref) => {
  return (
    <div ref={ref} className="p-1 bg-card">
    <div className={cn(
        "relative text-white rounded-2xl shadow-2xl overflow-hidden",
        "bg-gradient-to-br from-primary/90 via-primary to-accent/90"
    )}>
        {/* Background elements for texture */}
        <Plane className="absolute -bottom-8 -right-8 w-40 h-40 text-white/10 rotate-[30deg]"/>
        <Ticket className="absolute -top-10 -left-12 w-48 h-48 text-white/10 -rotate-[20deg]"/>

        <div className="relative z-10 p-6 flex flex-col h-full backdrop-blur-[2px]">
            <header className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/90 rounded-full">
                      <Logo />
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-2xl tracking-wider uppercase font-headline">Pase de Abordar</p>
                    <p className="text-sm text-white/80">Boarding Pass</p>
                </div>
            </header>

            <main className="my-6 grid grid-cols-3 gap-6 flex-1">
                <div className="col-span-2 space-y-5">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                        <InfoItem label="Pasajero/a" value={ticket.passengerName} Icon={User} />
                        <InfoItem label="DNI" value={ticket.passengerDni} />
                        <InfoItem label="Destino" value={ticket.tripDestination} Icon={MapPin} />
                        <InfoItem label="Fecha y Hora" value={format(new Date(ticket.tripDate), "dd MMM yyyy, HH:mm 'hs'", { locale: es })} Icon={Calendar} />
                        <InfoItem label="Asiento" value={ticket.seat.seatId} Icon={Armchair} largeValue/>
                        <InfoItem label="Micro" value={String(ticket.seat.bus)} Icon={Bus} largeValue/>
                    </div>
                </div>
                
                <div className="col-span-1 flex flex-col items-center justify-between border-l-2 border-dashed border-white/50 pl-6">
                    <div className="text-center">
                        <p className="text-sm text-white/80">Código de Embarque</p>
                        <Image 
                            src={ticket.qrCodeUrl}
                            alt="QR Code"
                            width={120}
                            height={120}
                            className="rounded-lg shadow-md mt-2 bg-white p-1"
                            data-ai-hint="qr code"
                        />
                    </div>
                    <p className="text-[10px] text-white/70 text-center tracking-tight">Presentá este código al abordar. ID: {ticket.id}</p>
                </div>
            </main>

            <footer className="mt-auto border-t border-white/20 pt-3">
                 <p className="text-xs text-white/80 text-center font-medium">¡Que tengas un excelente viaje con YO TE LLEVO!</p>
            </footer>

            {/* Perforation effect */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-card rounded-r-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-card rounded-l-full" />
        </div>
    </div>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"


interface InfoItemProps {
    Icon?: React.ElementType;
    label: string;
    value: string;
    largeValue?: boolean;
}

const InfoItem = ({ Icon, label, value, largeValue = false }: InfoItemProps) => (
    <div className="flex items-start gap-2 min-w-0">
        {Icon && <Icon className="w-5 h-5 text-white/70 mt-0.5 shrink-0" />}
        <div>
            <p className="text-xs text-white/80 uppercase tracking-wider">{label}</p>
            <p className={cn(
              "font-bold text-white truncate",
              largeValue ? "text-2xl" : "text-base"
            )}>{value}</p>
        </div>
    </div>
);
