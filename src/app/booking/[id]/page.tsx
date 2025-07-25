
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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
import { mockTours, mockReservations, mockSellers, mockPassengers } from "@/lib/mock-data"
import type { Tour, Reservation, Passenger, Seller, PricingTier } from "@/lib/types"
import { DatePicker } from "@/components/ui/date-picker"
import { ArrowLeft, CalendarIcon, ClockIcon, MapPinIcon, PlusIcon, TicketIcon, UsersIcon, HeartIcon, ArrowRight, PercentSquare, ShieldCheck, Trash2 } from "lucide-react"
import Link from "next/link"

type BookingPassenger = Omit<Passenger, 'fullName'> & { firstName: string; lastName: string };

const adultTier: PricingTier = { id: 'adult', name: 'Adulto', price: 0 };

export default function BookingPage() {
  const { id } = useParams()
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast()

  const [tour, setTour] = useState<Tour | null>(null)
  const [allPassengers, setAllPassengers] = useState<Passenger[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [bookingPassengers, setBookingPassengers] = useState<BookingPassenger[]>([])
  const [isClient, setIsClient] = useState(false)
  const [loggedInSellerId, setLoggedInSellerId] = useState<string | null>(null)
  
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
    
    const storedPassengers = localStorage.getItem("ytl_passengers");
    setAllPassengers(storedPassengers ? JSON.parse(storedPassengers) : mockPassengers);

    const employeeIdFromStorage = localStorage.getItem("ytl_employee_id");
    if (employeeIdFromStorage) {
        setLoggedInSellerId(employeeIdFromStorage);
    }
    
    const foundTour = tours.find((t) => t.id === id)
    if (foundTour) {
        if (new Date(foundTour.date) >= new Date()) {
            setTour(foundTour)
            setBookingPassengers([{
                id: `P${Date.now()}`,
                firstName: "",
                lastName: "",
                dni: "",
                dob: undefined,
                phone: "",
                family: "",
                nationality: "Argentina",
                tierId: 'adult'
            }])
        } else {
            setTour(null)
        }
    } else {
        setTour(null)
    }
  }, [id, searchParams])

  const addPassenger = () => {
    setBookingPassengers(prev => [...prev, {
        id: `P${Date.now()}`,
        firstName: "",
        lastName: "",
        dni: "",
        dob: undefined,
        phone: "",
        family: "",
        nationality: "Argentina",
        tierId: 'adult'
    }]);
  }

  const removePassenger = (passengerId: string) => {
    setBookingPassengers(prev => prev.filter(p => p.id !== passengerId));
  }

  const handlePassengerChange = (passengerId: string, field: keyof BookingPassenger, value: any) => {
    setBookingPassengers(prev => prev.map(p => 
        p.id === passengerId ? { ...p, [field]: value } : p
    ));
  }

  const handleConfirmReservation = () => {
    const mainPassenger = bookingPassengers[0];
    if (!mainPassenger?.firstName || !mainPassenger?.lastName || !mainPassenger?.dni || !mainPassenger?.phone) {
      toast({
        title: "Faltan datos",
        description: "Por favor, complete nombre, apellido, DNI y teléfono del pasajero principal.",
        variant: "destructive",
      })
      return
    }

    const sellerToAssign = loggedInSellerId || 'unassigned';
    
    const familyName = `Familia ${mainPassenger.lastName}`;

    // Save new passengers to the main list
    const updatedPassengers = [...allPassengers];
    const newPassengerList: Passenger[] = bookingPassengers.map(bp => {
        const finalPassenger: Passenger = { 
            ...bp, 
            fullName: `${bp.firstName} ${bp.lastName}`.trim(),
            family: familyName 
        };
        const existingIndex = updatedPassengers.findIndex(p => p.dni === bp.dni);
        if (existingIndex > -1) {
            updatedPassengers[existingIndex] = { ...updatedPassengers[existingIndex], ...finalPassenger };
        } else {
            updatedPassengers.push(finalPassenger);
        }
        return finalPassenger;
    });

    localStorage.setItem("ytl_passengers", JSON.stringify(updatedPassengers));


    const reservationId = `YTL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const newReservation: Reservation = {
        id: reservationId,
        tripId: tour!.id,
        passenger: newPassengerList[0].fullName,
        paxCount: newPassengerList.length,
        assignedSeats: [],
        assignedCabins: [],
        status: "Pendiente",
        paymentStatus: "Pendiente",
        sellerId: sellerToAssign,
        finalPrice: totalPrice
    };

    const updatedReservations = [...reservations, newReservation];
    localStorage.setItem('ytl_reservations', JSON.stringify(updatedReservations));

    toast({
      title: "¡Solicitud Enviada!",
      description: `Tu reserva para ${tour?.destination} ha sido recibida.`,
      duration: 3000,
    })

    const confirmationData = {
        reservation: newReservation,
        tour: tour,
        seller: sellers.find(s => s.id === sellerToAssign)
    }
    
    sessionStorage.setItem('ytl_last_reservation', JSON.stringify(confirmationData));
    
    router.push('/booking/confirmation');
  }
  
  const totalPassengers = bookingPassengers.length;
  const availableTiers = tour ? [adultTier, ...(tour.pricingTiers || [])] : [adultTier];

  const tourBasePrice = bookingPassengers.reduce((total, p) => {
    const tier = availableTiers.find(t => t.id === p.tierId);
    return total + (tier?.id === 'adult' ? (tour?.price || 0) : (tier?.price || 0));
  }, 0);

  const insuranceCost = tour?.insurance?.active ? totalPassengers * tour.insurance.cost : 0;
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
                  <CardTitle className="flex items-center gap-3 text-2xl"><UsersIcon className="w-8 h-8 text-primary"/> Datos de los Pasajeros</CardTitle>
                   <CardDescription>El primer pasajero es el responsable de la reserva. Su teléfono es obligatorio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {bookingPassengers.map((passenger, index) => (
                    <div key={passenger.id} className="p-4 border rounded-lg space-y-4 relative bg-background">
                         {bookingPassengers.length > 1 && (
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removePassenger(passenger.id)}>
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                         )}
                        <p className="font-semibold">Pasajero {index + 1}</p>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                             <div className="space-y-2">
                                <Label htmlFor={`firstName-${passenger.id}`}>Nombres</Label>
                                <Input id={`firstName-${passenger.id}`} value={passenger.firstName} onChange={(e) => handlePassengerChange(passenger.id, 'firstName', e.target.value)} placeholder="Ej: Juan Carlos" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`lastName-${passenger.id}`}>Apellido</Label>
                                <Input id={`lastName-${passenger.id}`} value={passenger.lastName} onChange={(e) => handlePassengerChange(passenger.id, 'lastName', e.target.value)} placeholder="Ej: Pérez" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`dni-${passenger.id}`}>DNI</Label>
                                <Input id={`dni-${passenger.id}`} value={passenger.dni} onChange={(e) => handlePassengerChange(passenger.id, 'dni', e.target.value)} placeholder="Sin puntos ni espacios" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`phone-${passenger.id}`}>Teléfono {index > 0 && '(Opcional)'}</Label>
                                <Input id={`phone-${passenger.id}`} value={passenger.phone} onChange={(e) => handlePassengerChange(passenger.id, 'phone', e.target.value)} placeholder="Ej: 1122334455" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`dob-${passenger.id}`}>Fecha de nacimiento</Label>
                                <DatePicker 
                                    date={passenger.dob} 
                                    setDate={(d) => handlePassengerChange(passenger.id, 'dob', d)} 
                                    placeholder="Seleccionar fecha"
                                    captionLayout="dropdown-buttons"
                                    fromYear={new Date().getFullYear() - 100}
                                    toYear={new Date().getFullYear()}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`tierId-${passenger.id}`}>Tipo de Pasajero</Label>
                                <Select value={passenger.tierId} onValueChange={val => handlePassengerChange(passenger.id, 'tierId', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {availableTiers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    ))}
                    <Button variant="outline" onClick={addPassenger}>
                        <PlusIcon className="mr-2 h-4 w-4"/> Añadir Pasajero
                    </Button>
                </CardContent>
              </Card>

              {loggedInSellerId && (
                <p className="text-sm text-center text-muted-foreground mt-2">Venta asignada a tu usuario.</p>
              )}
              
              {!loggedInSellerId && (
                <Card className="bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground shadow-lg">
                    <CardHeader>
                    <CardTitle className="font-body drop-shadow-xl tracking-wider flex items-center gap-2">
                        <HeartIcon className="w-6 h-6" />
                        ¿Querés agilizar tus próximas reservas?
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                        Crea una cuenta para guardar tus datos y acceder a beneficios exclusivos. ¡Es rápido y fácil!
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
                        <Link href="/login?mode=register">
                            Crear una cuenta <ArrowRight className="w-4 h-4 ml-2"/>
                        </Link>
                    </Button>
                    </CardContent>
                </Card>
              )}

            </div>

            <div className="space-y-8 lg:col-span-1">
              <Card className="sticky top-24 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl"><TicketIcon className="w-8 h-8 text-primary" /> Resumen de reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 space-y-3 rounded-lg bg-secondary/40">
                      {bookingPassengers.map(p => {
                          const tier = availableTiers.find(t => t.id === p.tierId);
                          const price = tier?.id === 'adult' ? tour.price : tier?.price ?? 0;
                          return (
                            <div key={p.id} className="flex justify-between font-medium">
                                <span>{tier?.name || 'Adulto'}</span>
                                <span>${price.toLocaleString('es-AR')}</span>
                            </div>
                          )
                      })}
                      {tour.insurance?.active && tour.insurance.cost > 0 && (
                         <div className="flex justify-between font-medium text-sm border-t pt-2 mt-2 border-primary/20">
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
                  <Button className="w-full text-lg h-14 rounded-xl group" size="lg" onClick={handleConfirmReservation} disabled={totalPassengers === 0}>
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
