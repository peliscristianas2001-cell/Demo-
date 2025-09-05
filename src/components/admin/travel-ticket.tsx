
"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Ticket as TicketType, Tour, Seller, BoardingPoint, Pension } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import Image from "next/image"
import { 
    Users, MapPin, CalendarDays, BedDouble, Utensils, Bus, Clock, Armchair, 
    FileText, Info, AlertTriangle, UserSquare, UserCircle, Building, TicketIcon, QrCode, Loader2
} from "lucide-react"

interface TravelTicketProps {
  ticket: TicketType;
  tour: Tour;
  seller?: Seller;
  boardingPoint?: BoardingPoint;
  pension?: Pension;
}

const InfoSection = ({ title, icon: Icon, children, className, titleClassName, contentClassName }: { title: string, icon?: React.ElementType, children: React.ReactNode, className?: string, titleClassName?: string, contentClassName?: string }) => (
    <div className={cn("rounded-lg border bg-card shadow-sm overflow-hidden", className)}>
        <div className={cn("bg-primary text-primary-foreground p-2 flex items-center gap-2", titleClassName)}>
            {Icon && <Icon className="w-5 h-5" />}
            <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
        </div>
        <div className={cn("p-3 space-y-1.5 text-sm", contentClassName)}>
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value }: { label: string, value?: React.ReactNode }) => (
    <div className="flex justify-between items-start gap-2">
        <span className="font-semibold text-muted-foreground flex-shrink-0">{label}:</span>
        <span className="text-right font-medium text-foreground break-words">{value || "—"}</span>
    </div>
)

function QRCodeDisplay({ url }: { url: string }) {
    const [qrUrl, setQrUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Use an image proxy to avoid CORS issues and cache the image
        fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load QR code');
                return res.blob();
            })
            .then(blob => {
                const objectUrl = URL.createObjectURL(blob);
                setQrUrl(objectUrl);
                // Cleanup function to revoke the object URL
                return () => URL.revokeObjectURL(objectUrl);
            })
            .catch(err => {
                console.error("QR Code Error:", err);
                // Fallback to direct URL if proxy fails, though it might not render in canvas
                setQrUrl(url); 
            })
            .finally(() => setIsLoading(false));
        
    }, [url]);

    if (isLoading) {
        return (
            <div className="text-center">
                <Loader2 className="w-16 h-16 mx-auto text-gray-600 animate-spin"/>
                <p className="text-xs text-gray-600 mt-2">Cargando QR...</p>
            </div>
        );
    }

    if (!qrUrl) {
         return (
            <div className="text-center">
                <QrCode className="w-16 h-16 mx-auto text-destructive"/>
                <p className="text-xs text-destructive mt-2">Error QR</p>
            </div>
        );
    }

    return <Image src={qrUrl} alt="Código QR" width={150} height={150} />;
}


export const TravelTicket = React.forwardRef<HTMLDivElement, TravelTicketProps>(({ ticket, tour, seller, boardingPoint, pension }, ref) => {
  const reservation = ticket.reservation;

  const assignedLocations = [
    ...(reservation.assignedSeats || []).map(s => s.seatId),
    ...(reservation.assignedCabins || []).map(c => c.cabinId)
  ].join(', ') || "Asignada por coordinador";

  const nightsAndRoom = tour.nights && tour.nights > 0 
    ? `${tour.nights} ${tour.nights > 1 ? 'noches' : 'noche'} - ${reservation.roomType || 'No especificada'}`
    : "Solo ida";
    
  return (
    <div ref={ref} className={cn(
      "bg-slate-100 text-black rounded-lg overflow-hidden shadow-2xl border",
      "w-[794px] min-h-[1123px] p-6 font-sans flex flex-col gap-4"
    )}>
        <header className="flex justify-between items-center border-b-2 border-primary/20 pb-4">
           <Logo />
           <div className="text-right">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2"><TicketIcon/> PASE DE ABORDO</h2>
                <p className="text-sm text-muted-foreground">ID Reserva: {reservation.id}</p>
           </div>
        </header>

        <main className="grid grid-cols-12 gap-4 flex-grow">
            {/* Columna Izquierda */}
            <div className="col-span-8 space-y-3">
                 <InfoSection title="Pasajeros" icon={Users}>
                    <InfoRow label="Nombre Pasajero" value={reservation.passenger} />
                    <InfoRow label="Cantidad (PAX)" value={`${reservation.paxCount} persona(s)`} />
                 </InfoSection>
                 <div className="grid grid-cols-2 gap-3">
                    <InfoSection title="Origen y Destino" icon={MapPin}>
                        <InfoRow label="Origen" value={tour.origin} />
                        <InfoRow label="Destino" value={tour.destination} />
                    </InfoSection>
                    <InfoSection title="Fecha de Salida" icon={CalendarDays}>
                        <InfoRow label="Fecha" value={format(new Date(tour.date), "dd/MM/yyyy", { locale: es })} />
                    </InfoSection>
                 </div>
                  <InfoSection title="Alojamiento y Comidas" icon={BedDouble}>
                    <InfoRow label="Noches / Habitación" value={nightsAndRoom} />
                    <InfoRow label="Régimen de Comidas" value={pension?.name || 'Sin pensión'} />
                 </InfoSection>
                 <InfoSection title="Datos del Transporte" icon={Bus}>
                    <InfoRow label="Empresa" value={tour.bus} />
                    <InfoRow label="Embarque" value={boardingPoint?.name} />
                    <InfoRow label="Plataforma" value={tour.platform} />
                 </InfoSection>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoSection title="Horario" icon={Clock}>
                        <InfoRow label="Presentación" value={tour.presentationTime} />
                        <InfoRow label="Salida" value={tour.departureTime} />
                    </InfoSection>
                     <InfoSection title="Butacas" icon={Armchair}>
                        <InfoRow label="Ubicación" value={assignedLocations} />
                    </InfoSection>
                  </div>
                   <InfoSection title="Condiciones" icon={FileText} contentClassName="text-xs text-center text-muted-foreground">
                        <p>{tour.cancellationPolicy || "Consulte la política de cancelación."}</p>
                    </InfoSection>
            </div>

            {/* Columna Derecha */}
            <div className="col-span-4 space-y-3 flex flex-col">
                 <InfoSection title="Agencia" icon={Building}>
                    <InfoRow label="Nombre" value="YO TE LLEVO" />
                 </InfoSection>
                 <InfoSection title="Coordinador/a" icon={UserSquare}>
                    <InfoRow label="Nombre" value={tour.coordinator} />
                    <InfoRow label="Teléfono" value={tour.coordinatorPhone} />
                 </InfoSection>
                  <InfoSection title="Vendedor/a" icon={UserCircle}>
                    <InfoRow label="Nombre" value={seller?.name} />
                 </InfoSection>
                  <InfoSection title="Observaciones" icon={Info} contentClassName="text-center font-medium">
                     <p>{tour.observations || "Obligatorio llevar D.N.I."}</p>
                 </InfoSection>
                 <div className="flex-grow flex items-center justify-center">
                    <div className="w-[150px] h-[150px] flex items-center justify-center bg-gray-200 rounded-md p-2" data-qr-container>
                        <QRCodeDisplay url={ticket.qrCodeUrl} />
                    </div>
                 </div>
                  <InfoSection title="Importante" icon={AlertTriangle} titleClassName="bg-destructive text-destructive-foreground" contentClassName="text-center font-bold text-lg text-destructive">
                    <p>¡PUNTUALIDAD CON LOS HORARIOS!</p>
                 </InfoSection>
            </div>
        </main>
    </div>
  )
})
TravelTicket.displayName = "TravelTicket"
