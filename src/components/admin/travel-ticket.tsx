
"use client"

import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { Ticket, User, Calendar, MapPin, Armchair, Bus } from "lucide-react"
import type { Ticket as TicketType } from "@/lib/types"

interface TravelTicketProps {
  ticket: TicketType;
}

export function TravelTicket({ ticket }: TravelTicketProps) {
  return (
    <Card className="bg-gradient-to-br from-background to-secondary/30 shadow-lg break-inside-avoid page-break">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Logo />
        <div className="flex items-center gap-2 text-primary">
          <Ticket className="w-6 h-6" />
          <span className="font-bold text-lg">Pase de Abordar</span>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Destino</p>
            <p className="text-xl font-bold text-foreground">{ticket.tripDestination}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <p className="text-sm font-semibold text-muted-foreground">Pasajero/a</p>
                <p className="font-medium text-foreground">{ticket.passengerName}</p>
            </div>
             <div>
                <p className="text-sm font-semibold text-muted-foreground">DNI</p>
                <p className="font-medium text-foreground">{ticket.passengerDni}</p>
            </div>
            <div>
                <p className="text-sm font-semibold text-muted-foreground">Fecha y Hora</p>
                <p className="font-medium text-foreground">
                    {format(new Date(ticket.tripDate), "dd/MM/yyyy 'a las' HH:mm 'hs'", { locale: es })}
                </p>
            </div>
             <div>
                <p className="text-sm font-semibold text-muted-foreground">Lugar de Salida</p>
                <p className="font-medium text-foreground">Buenos Aires</p>
            </div>
             <div>
                <p className="text-sm font-semibold text-muted-foreground">Asiento</p>
                <p className="font-bold text-lg text-primary">{ticket.seat.seatId}</p>
            </div>
            <div>
                <p className="text-sm font-semibold text-muted-foreground">Micro</p>
                <p className="font-bold text-lg text-primary">{ticket.seat.bus}</p>
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col items-center justify-center gap-2 border-l pl-4">
            <Image 
                src={ticket.qrCodeUrl}
                alt="QR Code"
                width={150}
                height={150}
                className="rounded-lg shadow-md"
                data-ai-hint="qr code"
            />
            <p className="text-xs text-muted-foreground text-center mt-2">Presentá este código al subir al micro.</p>
        </div>
      </CardContent>
      <CardFooter>
         <p className="text-xs text-muted-foreground">
            ID de Ticket: {ticket.id}
          </p>
      </CardFooter>
    </Card>
  )
}
