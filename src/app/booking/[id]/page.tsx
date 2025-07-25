
"use client"

import { useState, useEffect, use } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { mockTours, mockReservations, mockSellers } from "@/lib/mock-data"
import type { Tour, Reservation, Passenger, Seller } from "@/lib/types"
import { DatePicker } from "@/components/ui/date-picker"
import { ArrowLeft, CalendarIcon, ClockIcon, MapPinIcon, MinusIcon, PlusIcon, TicketIcon, UsersIcon, UserIcon, HeartIcon, ArrowRight, PercentSquare, ShieldCheck } from "lucide-react"

export default function BookingPage() {
  const { id } = use(useParams())
  const router = useRouter();
  const { toast } = useToast()

  const [tour, setTour] = useState<Tour | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [selectedSellerId, setSelectedSellerId] = useState<string>("");
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    const storedTours = localStorage.getItem("ytl_tours")
    const tours: Tour[] = storedTours ? JSON.parse(storedTours) : mockTours;
    
    const storedReservations = localStorage.getItem("ytl_reservations");
    const currentReservations: Reservation[] = storedReservations ? JSON.parse(storedReservations) : mockReservations;
    setReservations(currentReservations);

    const storedSellers = localStorage.getItem("ytl_sellers");
    const currentSellers: Seller[] = storedSellers ? JSON.parse(storedSellers) : mockSellers;
    setSellers(currentSellers);
    
    const foundTour = tours.find((t) => t.id === id)
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
  }, [adults, children])

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

    if (!selectedSellerId) {
       toast({
        title: "Vendedora no seleccionada",
        description: "Por favor, selecciona quién te vendió el viaje.",
        variant: "destructive",
      })
      return
    }

    const reservationId = `YTL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const newReservation: Reservation = {
        id: reservationId,
        tripId: tour!.id,
        passenger: passengers[0].fullName,
        paxCount: passengers.length,
        assignedSeats: [],
        assignedCabins: [],
        status: "Pendiente",
        paymentStatus: "Pendiente",
        sellerId: selectedSellerId,
        finalPrice: totalPrice
    };

    const updatedReservations = [...reservations, newReservation];
    localStorage.setItem('ytl_reservations', JSON.stringify(updatedReservations));

    toast({
      title: "¡Reserva Recibida!",
      description: `Tu solicitud para ${tour?.destination} fue enviada. Un administrador te contactará para confirmar. N°: ${reservationId}`,
      duration: 9000,
    })

    setTimeout(() => {
        router.push('/');
    }, 3000);
  }
  
  const totalPassengers = adults + children;
  const insuranceCost = tour?.insurance ? totalPassengers * tour.insurance.cost : 0;
  const tourBasePrice = tour ? totalPassengers * tour.price : 0;
  const totalPrice = tourBasePrice + insuranceCost;

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
        <div className="container">
          <Button variant="ghost" onClick={() => router.back()} className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a los viajes
          </Button>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="overflow-hidden shadow-lg">
                <div className="relative h-48 sm:h-64">
                  <Image src={tour.flyerUrl} alt={tour.destination} layout="fill" objectFit="cover" className="brightness-90" data-ai-hint="travel destination"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-6 flex flex-col justify-end">
                      <h1 className="text-3xl sm:text-4xl font-headline text-white drop-shadow-xl">{tour.destination}</h1>
                  </div>
                </div>
                <CardContent className="p-6 bg-card">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-primary" /><span>Salida desde Buenos Aires</span></div>
                      <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-primary" /><span>{new Date(tour.date).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                      <div className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-primary" /><span>{new Date(tour.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span></div>
                  </div>
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
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl"><PercentSquare className="w-8 h-8 text-primary" /> Vendedora</CardTitle>
                   <CardDescription>¿Quién te vendió este increíble viaje?</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedSellerId} onValueChange={setSelectedSellerId}>
                        <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecciona una vendedora..." />
                        </SelectTrigger>
                        <SelectContent>
                            {sellers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                        <span>Pasajeros</span>
                        <span>{totalPassengers} x ${tour.price.toLocaleString('es-AR')}</span>
                      </div>
                      {tour.insurance && tour.insurance.cost > 0 && (
                         <div className="flex justify-between font-medium">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-600"/>Seguro</span>
                            <span>{totalPassengers} x ${tour.insurance.cost.toLocaleString('es-AR')}</span>
                        </div>
                      )}
                  </div>
                  <Separator />
                  <div className="flex items-baseline justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-3xl sm:text-4xl">${totalPrice.toLocaleString('es-AR')}</span>
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
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
