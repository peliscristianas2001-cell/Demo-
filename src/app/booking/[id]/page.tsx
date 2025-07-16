"use client"

import { useState, useEffect } from "react"
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
import { mockTours } from "@/lib/mock-data"
import type { Tour } from "@/lib/types"
import { SeatSelector } from "@/components/booking/seat-selector"
import { DatePicker } from "@/components/ui/date-picker"
import { CalendarIcon, ClockIcon, MapPinIcon, MinusIcon, PlusIcon, TicketIcon, UsersIcon, UserIcon, HashIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


interface Passenger {
  fullName: string
  dni: string
  dob?: Date
  nationality: string
  seat: string | null
}

export default function BookingPage() {
  const params = useParams()
  const { id } = params
  const { toast } = useToast()

  const [tour, setTour] = useState<Tour | null>(null)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0)

  useEffect(() => {
    const foundTour = mockTours.find((t) => t.id === id)
    setTour(foundTour || null)
  }, [id])

  useEffect(() => {
    const totalPassengers = adults + children
    const newPassengers = Array.from({ length: totalPassengers }, (_, i) => passengers[i] || {
      fullName: "",
      dni: "",
      dob: undefined,
      nationality: "Argentina",
      seat: null
    })
    setPassengers(newPassengers)
    
    const newSelectedSeats = newPassengers.map(p => p.seat).filter(Boolean) as string[];
    setSelectedSeats(newSelectedSeats);
    
    if (currentPassengerIndex >= totalPassengers) {
      setCurrentPassengerIndex(totalPassengers > 0 ? totalPassengers - 1 : 0);
    }
  }, [adults, children])

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    const newPassengers = [...passengers]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    setPassengers(newPassengers)
  }

  const handleSeatSelect = (seat: string) => {
    if (tour?.occupiedSeats.includes(seat)) return

    const totalPassengers = adults + children
    if (currentPassengerIndex >= totalPassengers) return
    
    const newPassengers = [...passengers];
    const newSelectedSeats = [...selectedSeats];

    const currentSeatForPassenger = newPassengers[currentPassengerIndex].seat;
    if (currentSeatForPassenger) {
       const seatIndex = newSelectedSeats.indexOf(currentSeatForPassenger);
       if (seatIndex > -1) newSelectedSeats.splice(seatIndex, 1);
    }

    if (newSelectedSeats.includes(seat)) { // Deselecting seat from another passenger
      const passengerIndexWithSeat = newPassengers.findIndex(p => p.seat === seat);
      if(passengerIndexWithSeat > -1) newPassengers[passengerIndexWithSeat].seat = null;
    }

    newPassengers[currentPassengerIndex].seat = seat;
    newSelectedSeats.push(seat);

    setPassengers(newPassengers);
    setSelectedSeats(newSelectedSeats);
    
    if (currentPassengerIndex < totalPassengers - 1) {
      setCurrentPassengerIndex(currentPassengerIndex + 1);
    }
  }

  const handleConfirmReservation = () => {
    // Basic validation
    if (passengers.some(p => !p.fullName || !p.dni || !p.seat)) {
      toast({
        title: "Error de validación",
        description: "Por favor, complete todos los datos de los pasajeros y seleccione sus asientos.",
        variant: "destructive",
      })
      return
    }

    const reservationId = `YTL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    toast({
      title: "¡Reserva Confirmada!",
      description: `Tu reserva para ${tour?.destination} ha sido confirmada. Tu número de reserva es ${reservationId}.`,
      duration: 9000,
    })
  }
  
  const totalPassengers = adults + children;
  const totalPrice = tour ? totalPassengers * tour.price : 0

  if (!tour) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Cargando información del viaje...</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-headline text-primary">{tour.destination}</CardTitle>
                <div className="flex flex-wrap gap-4 pt-2 text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" /><span>Salida desde Buenos Aires</span></div>
                    <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /><span>{new Date(tour.date).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                    <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4" /><span>{new Date(tour.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span></div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UsersIcon className="w-6 h-6 text-primary"/> ¿Cuántos viajan?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adults" className="text-lg">Adultos</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setAdults(Math.max(1, adults - 1))}><MinusIcon className="w-4 h-4" /></Button>
                    <span className="w-12 text-center text-lg font-bold">{adults}</span>
                    <Button variant="outline" size="icon" onClick={() => setAdults(adults + 1)}><PlusIcon className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="children" className="text-lg">Niños</Label>
                   <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setChildren(Math.max(0, children - 1))}><MinusIcon className="w-4 h-4" /></Button>
                    <span className="w-12 text-center text-lg font-bold">{children}</span>
                    <Button variant="outline" size="icon" onClick={() => setChildren(children + 1)}><PlusIcon className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {passengers.map((passenger, index) => (
              <Card key={index} className={currentPassengerIndex === index ? "border-primary border-2 shadow-lg" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-primary" />
                    Pasajero {index + 1}
                    {passenger.seat && <span className="text-sm font-medium px-2 py-1 rounded-md bg-accent text-accent-foreground">Asiento: {passenger.seat}</span>}
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
                      className="h-10 pl-3"
                     />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor={`nationality-${index}`}>Nacionalidad (opcional)</Label>
                    <Input id={`nationality-${index}`} value={passenger.nationality} onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            ))}

          </div>

          <div className="space-y-8 lg:col-span-1">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-armchair w-6 h-6 text-primary"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5Z"/><path d="M5 11v-2"/><path d="M19 11v-2"/></svg> Selección de asientos</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 bg-accent/50">
                    <AlertTitle>Pasajero {currentPassengerIndex + 1}</AlertTitle>
                    <AlertDescription>
                        Seleccioná el asiento para: <span className="font-semibold">{passengers[currentPassengerIndex]?.fullName || `Pasajero ${currentPassengerIndex + 1}`}</span>
                    </AlertDescription>
                </Alert>
                <SeatSelector
                    totalSeats={tour.totalSeats}
                    occupiedSeats={tour.occupiedSeats}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    passengerSeats={passengers.map(p => p.seat)}
                />
              </CardContent>
            </Card>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TicketIcon className="w-6 h-6 text-primary" /> Resumen de reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Pasajeros</span>
                  <span>{totalPassengers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio por pasajero</span>
                  <span>${tour.price.toLocaleString('es-AR')}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString('es-AR')}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleConfirmReservation} disabled={passengers.some(p => !p.seat)}>
                  Confirmar reserva
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
