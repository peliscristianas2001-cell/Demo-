
"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { mockTickets, mockTours } from "@/lib/mock-data";
import type { Ticket, Tour } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Ticket as TicketIcon, User, Plane, Calendar, Armchair, Ship, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const InfoItem = ({ label, value, large = false }: { label: string, value: string, large?: boolean }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("font-semibold", large ? "text-2xl" : "text-lg")}>{value}</p>
    </div>
);

export default function VerifyTicketPage() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [tour, setTour] = useState<Tour | null>(null);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (typeof id === 'string') {
            const foundTicket = mockTickets.find(t => t.id === id);
            if (foundTicket) {
                const foundTour = mockTours.find(t => t.id === foundTicket.tripId);
                setTicket(foundTicket);
                setTour(foundTour || null);
                setIsValid(!!foundTour);
            } else {
                setIsValid(false);
            }
        }
    }, [id]);

    const assignment = ticket ? ('seatId' in ticket.assignment ? {
        label: "Asiento",
        value: ticket.assignment.seatId,
        unitLabel: "Unidad",
        unitValue: String(ticket.assignment.unit)
    } : {
        label: "Camarote",
        value: ticket.assignment.cabinId,
        unitLabel: "Cubierta/Unidad",
        unitValue: String(ticket.assignment.unit)
    }) : null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <div className="w-full max-w-md mx-auto">
                 <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                <Card className="shadow-2xl">
                    <CardHeader className="text-center bg-card-foreground text-card p-6 rounded-t-lg">
                        <div className="flex justify-center mb-2">
                            <Logo />
                        </div>
                        <CardTitle className="text-2xl font-headline text-white">
                            Verificación de Ticket
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isValid === null && <p>Verificando...</p>}
                        
                        {isValid === false && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Ticket Inválido</AlertTitle>
                                <AlertDescription>
                                    El código QR no corresponde a un ticket válido o el viaje ha expirado.
                                </AlertDescription>
                            </Alert>
                        )}

                        {isValid && ticket && tour && assignment && (
                           <>
                            <Alert variant="default" className="bg-green-100 border-green-400 text-green-800 mb-6">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-900">Ticket Válido</AlertTitle>
                            </Alert>
                            <div className="space-y-4">
                                <InfoItem label="Pasajero" value={ticket.passengerName} />
                                <InfoItem label="DNI" value={ticket.passengerDni} />
                                <Separator />
                                <InfoItem label="Destino" value={tour.destination} />
                                <InfoItem label="Fecha de Salida" value={format(new Date(tour.date), "PPP, HH:mm 'hs'", { locale: es })} />
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <InfoItem label={assignment.label} value={assignment.value} large/>
                                    <InfoItem label={assignment.unitLabel} value={assignment.unitValue} large/>
                                </div>
                            </div>
                           </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Simple separator component for this page
const Separator = () => <hr className="my-2 border-border/50" />
