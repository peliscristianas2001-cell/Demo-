
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { mockTours, mockReservations } from "@/lib/mock-data"
import type { Tour } from "@/lib/types"
import { DatePicker } from "@/components/ui/date-picker"
import { SeatSelector } from "@/components/booking/seat-selector"
import { Armchair, CalendarIcon, ClockIcon, MapPinIcon, MinusIcon, PlusIcon, TicketIcon, UsersIcon, UserIcon, HeartIcon, ArrowRight, Bus } from "lucide-react"

interface Passenger {
  fullName: string
  dni: string
  dob?: Date
  nationality: string
}

export default function BookingPage() {
  const params = useParams()
  const { id } = params
  const { toast } = useToast()

  const [tour, setTour] = useState<Tour | null>(null)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [isClient, setIsClient] = useState(false)
  
  const occupiedSeats = useMemo(() => {
    if (!tour) return [];
    return mockReservations
      .filter(r => r.tripId === tour.id)
      .flatMap(r => r.assignedSeats.map(s => s.seatId)); // Simplified for client view
  }, [tour]);


  useEffect(() => {
    setIsClient(true)
    const foundTour = mockTours.find((t) => t.id === id)
    if (foundTour && new Date(foundTour.date) >= new Date()) {
        setTour(foundTour)
    } else {
        setTour(null)
    }
  }, [id])

  useEffect(() => {
    const totalPassengers = adults + children
    const newPassengers = Array.from({ length: totalPassengers }, (_, i) => passengers[i] || {
      fullName: "",
      dni: "",
      dob: undefined,
      nationality: "Argentina",
    })
    setPassengers(newPassengers)
  }, [adults, children, passengers.length])

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    const newPassengers = [...passengers]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    setPassengers(newPassengers)
  }

  const handleConfirmReservation = () => {
    if (passengers.some(p => !p.fullName || !p.dni)) {
      toast({
        title: "Faltan datos",
        description: "Por favor, complete nombre y DNI de todos los pasajeros.",
        variant: "destructive",
      })
      return
    }

    const reservationId = `YTL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    toast({
      title: "¡Reserva Recibida!",
      description: `Tu solicitud para ${tour?.destination} fue enviada. Un administrador te contactará para confirmar. N°: ${reservationId}`,
      duration: 9000,
    })
  }
  
  const totalPassengers = adults + children;
  const totalPrice = tour ? totalPassengers * tour.price : 0

  if (!isClient) {
    return null; // Don't render anything on the server
  }

  if (!tour) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center text-center p-8">
            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle>Viaje no disponible</CardTitle>
                    <CardDescription>
                        Lo sentimos, el viaje que buscas ya no está disponible o la fecha ha expirado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <a href="/tours">Ver otros viajes</a>
                    </Button>
                </CardContent>
            </Card>
        </main>
        <SiteFooter />
      </div>
    )
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden shadow-lg">
              <div className="relative h-64">
                <Image src={tour.flyerUrl} alt={tour.destination} layout="fill" objectFit="cover" className="brightness-90" data-ai-hint="travel destination"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-6 flex flex-col justify-end">
                    <h1 className="text-4xl font-headline text-white drop-shadow-xl">{tour.destination}</h1>
                </div>
              </div>
              <CardContent className="p-6 bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-primary" /><span>Salida desde Buenos Aires</span></div>
                    <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-primary" /><span>{new Date(tour.date).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                    <div className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-primary" /><span>{new Date(tour.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl"><Armchair className="w-8 h-8 text-primary"/> Disponibilidad de Asientos</CardTitle>
                    <CardDescription>
                        Estos son los asientos ya ocupados. La administradora te asignará tus lugares una vez confirmada la reserva.
                    </CardDescription>
                    {tour.busCount > 1 && (
                      <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                        <Bus className="w-5 h-5" />
                        <span>Este viaje cuenta con {tour.busCount} micros. El mapa muestra la disponibilidad general.</span>
                      </div>
                    )}
                </CardHeader>
                <CardContent>
                    <SeatSelector 
                        totalSeats={tour.totalSeats}
                        occupiedSeats={occupiedSeats}
                        selectedSeats={[]}
                        onSeatSelect={() => {}} // No action for client
                        passengerSeats={[]}
                    />
                </CardContent>
            </Card>


            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl"><UsersIcon className="w-8 h-8 text-primary"/> ¿Cuántos viajan?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/40">
                  <div>
                    <Label htmlFor="adults" className="text-lg font-medium">Adultos</Label>
                    <p className="text-sm text-muted-foreground">Mayores de 12 años</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setAdults(Math.max(1, adults - 1))}><MinusIcon className="w-4 h-4" /></Button>
                    <span className="w-12 text-center text-xl font-bold">{adults}</span>
                    <Button variant="outline" size="icon" onClick={() => setAdults(adults + 1)}><PlusIcon className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/40">
                   <div>
                    <Label htmlFor="children" className="text-lg font-medium">Niños</Label>
                    <p className="text-sm text-muted-foreground">Menores de 12 años</p>
                  </div>
                   <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setChildren(Math.max(0, children - 1))}><MinusIcon className="w-4 h-4" /></Button>
                    <span className="w-12 text-center text-xl font-bold">{children}</span>
                    <Button variant="outline" size="icon" onClick={() => setChildren(children + 1)}><PlusIcon className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {passengers.map((passenger, index) => (
              <Card key={index} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <UserIcon className="w-8 h-8 text-primary" />
                    Datos del Pasajero {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`fullName-${index}`}>Nombre completo</Label>
                    <Input id={`fullName-${index}`} value={passenger.fullName} onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)} placeholder="Ej: Juan Pérez" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`dni-${index}`}>DNI</Label>
                    <Input id={`dni-${index}`} value={passenger.dni} onChange={(e) => handlePassengerChange(index, 'dni', e.target.value)} placeholder="Sin puntos ni espacios" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor={`dob-${index}`}>Fecha de nacimiento</Label>
                    <DatePicker 
                      date={passenger.dob} 
                      setDate={(d) => handlePassengerChange(index, 'dob', d)} 
                      placeholder="Seleccionar fecha"
                     />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor={`nationality-${index}`}>Nacionalidad</Label>
                    <Input id={`nationality-${index}`} value={passenger.nationality} onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <HeartIcon className="w-6 h-6" />
                  ¿Querés agilizar tus próximas reservas?
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Crea una cuenta para guardar tus datos y acceder a beneficios exclusivos. ¡Es rápido y fácil!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">Crear una cuenta <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </CardContent>
            </Card>

          </div>

          <div className="space-y-8 lg:col-span-1">
            <Card className="sticky top-24 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl"><TicketIcon className="w-8 h-8 text-primary" /> Resumen de reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 space-y-3 rounded-lg bg-secondary/40">
                    <div className="flex justify-between font-medium">
                      <span>Adultos</span>
                      <span>{adults} x ${tour.price.toLocaleString('es-AR')}</span>
                    </div>
                     <div className="flex justify-between font-medium">
                      <span>Niños</span>
                      <span>{children} x ${tour.price.toLocaleString('es-AR')}</span>
                    </div>
                 </div>
                <Separator />
                <div className="flex items-baseline justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-4xl">${totalPrice.toLocaleString('es-AR')}</span>
                </div>
                 <p className="text-xs text-muted-foreground text-center">
                  El pago se coordina por WhatsApp luego de enviar la solicitud.
                </p>
                <Button className="w-full text-lg h-14 rounded-xl group" size="lg" onClick={handleConfirmReservation}>
                  Solicitar Reserva
                   <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
