
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { SeatSelector } from "@/components/booking/seat-selector"
import { MoreHorizontal, CheckCircle, Clock, Trash2, Armchair, Bus } from "lucide-react"
import { mockTours, mockReservations } from "@/lib/mock-data"
import type { Tour, Reservation, ReservationStatus, AssignedSeat, VehicleType } from "@/lib/types"
import { getVehicleConfig } from "@/lib/vehicle-config"

type ActiveBusInfo = {
  busNumber: number;
  type: VehicleType;
} | null;

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tours, setTours] = useState<Tour[]>([]);
  const [activeBus, setActiveBus] = useState<ActiveBusInfo>(null);
  const [isClient, setIsClient] = useState(false)
  const [vehicleConfig, setVehicleConfig] = useState(getVehicleConfig(true));

  useEffect(() => {
    setIsClient(true)
    const storedReservations = localStorage.getItem("ytl_reservations")
    const storedTours = localStorage.getItem("ytl_tours")
    
    if (storedReservations) {
        setReservations(JSON.parse(storedReservations, (key, value) => {
            if (key === 'date') return new Date(value);
            return value;
        }));
    } else {
        setReservations(mockReservations)
    }

    if (storedTours) {
        setTours(JSON.parse(storedTours, (key, value) => {
             if (key === 'date') return new Date(value);
            return value;
        }));
    } else {
        setTours(mockTours);
    }

    const handleStorageChange = () => {
      setVehicleConfig(getVehicleConfig(true));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])

  useEffect(() => {
    if (isClient) {
        localStorage.setItem("ytl_reservations", JSON.stringify(reservations));
    }
  }, [reservations, isClient])


  const activeTours = useMemo(() => tours.filter(t => new Date(t.date) >= new Date()), [tours]);
  
  // Group reservations by tripId for easier rendering
  const reservationsByTrip = useMemo(() => {
    return activeTours.reduce((acc, tour) => {
        const tripReservations = reservations.filter(res => res.tripId === tour.id);
        if (tripReservations.length > 0) {
            acc[tour.id] = {
                tour,
                reservations: tripReservations
            };
        }
        return acc;
    }, {} as Record<string, { tour: Tour, reservations: Reservation[] }>);
  }, [reservations, activeTours]);

  const getExpandedBusList = (tour: Tour): { type: VehicleType, typeName: string, instanceNum: number, globalBusNum: number }[] => {
    if (!tour.vehicles) return [];
    
    let globalBusCounter = 1;
    const busList = [];

    for (const [type, count] of Object.entries(tour.vehicles)) {
        if (count && count > 0) {
            for (let i = 1; i <= count; i++) {
                busList.push({
                    type: type as VehicleType,
                    typeName: vehicleConfig[type as VehicleType]?.name || 'Vehículo',
                    instanceNum: i,
                    globalBusNum: globalBusCounter
                });
                globalBusCounter++;
            }
        }
    }
    return busList;
  }

  const getVehicleCount = (tour: Tour) => {
    if (!tour.vehicles) return 0;
    return Object.values(tour.vehicles).reduce((total, count) => total + (count || 0), 0);
  }

  const handleStatusChange = (reservationId: string, newStatus: ReservationStatus) => {
    setReservations(reservations.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    ))
  }

  const handleDelete = (reservationId: string) => {
    setReservations(reservations.filter(res => res.id !== reservationId));
  }

  const handleSeatSelect = (reservationId: string, seatId: string, busNumber: number) => {
    setReservations(prevReservations => {
        return prevReservations.map(res => {
            if (res.id === reservationId) {
                const tour = tours.find(t => t.id === res.tripId);
                if (!tour) return res;

                let newAssignedSeats = [...res.assignedSeats];
                const seatIndex = newAssignedSeats.findIndex(s => s.seatId === seatId && s.bus === busNumber);

                if (seatIndex > -1) {
                    // Deselect seat
                    newAssignedSeats.splice(seatIndex, 1);
                } else {
                    // Select seat if not exceeding count
                    if (newAssignedSeats.length < res.seatsCount) {
                        newAssignedSeats.push({ seatId, bus: busNumber });
                    }
                }
                return { ...res, assignedSeats: newAssignedSeats };
            }
            return res;
        });
    });
};

  const getOccupiedSeatsForTour = (tourId: string, busNumber: number, currentReservationId: string) => {
    return reservations
      .filter(res => res.tripId === tourId && res.id !== currentReservationId)
      .flatMap(res => res.assignedSeats)
      .filter(seat => seat.bus === busNumber)
      .map(seat => seat.seatId);
  };


  const getStatusVariant = (status: ReservationStatus) => {
    switch (status) {
      case "Confirmado":
        return "secondary"
      case "Pendiente":
        return "outline"
      default:
        return "default"
    }
  }

  const handleDialogOpen = (tour: Tour) => {
    const busList = getExpandedBusList(tour);
    if (busList.length > 0) {
      setActiveBus({ busNumber: busList[0].globalBusNum, type: busList[0].type });
    } else {
      setActiveBus(null);
    }
  };
  
  const getBusIdentifier = (bus: {type: VehicleType, busNumber: number}) => {
    return `${bus.type}_${bus.busNumber}`;
  }


  if (!isClient) {
    return null; // Don't render server-side
  }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold">Gestión de Reservas</h2>
        <p className="text-muted-foreground">
          Visualiza las reservas para cada viaje, asigna asientos y gestiona los estados.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
           {Object.keys(reservationsByTrip).length === 0 ? (
                <div className="h-24 text-center flex items-center justify-center">
                    No hay reservas activas.
                </div>
            ) : (
                <Accordion type="multiple" className="w-full">
                    {Object.values(reservationsByTrip).map(({ tour, reservations: tripReservations }) => {
                       const expandedBusList = getExpandedBusList(tour);
                       const totalVehicleCount = expandedBusList.length;

                       return (
                       <AccordionItem value={tour.id} key={tour.id}>
                           <AccordionTrigger className="text-lg font-medium hover:no-underline">
                               {tour.destination} ({tripReservations.length} reservas)
                            </AccordionTrigger>
                           <AccordionContent>
                               <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Pasajero Principal</TableHead>
                                        <TableHead>Asientos</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tripReservations.map((res) => {
                                            return (
                                                <TableRow key={res.id}>
                                                    <TableCell>{res.passenger}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{res.assignedSeats.length} / {res.seatsCount}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(res.status)}>
                                                        {res.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Dialog
                                                          onOpenChange={(open) => {
                                                            if (open) {
                                                              handleDialogOpen(tour);
                                                            } else {
                                                              setActiveBus(null);
                                                            }
                                                          }}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Armchair className="mr-2 h-4 w-4" /> Asignar Asientos
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
                                                                <DialogHeader className="p-6 pb-4">
                                                                    <DialogTitle>Asignar asientos para {res.passenger}</DialogTitle>
                                                                    <DialogDescription>
                                                                        Viaje a {res.tripDestination}. Reservó {res.seatsCount} asiento(s).
                                                                        Selecciona su/s lugar/es en el mapa.
                                                                    </DialogDescription>
                                                                    {totalVehicleCount > 1 && activeBus && (
                                                                        <div className="flex items-center gap-2 pt-2">
                                                                            <Bus className="w-5 h-5 text-muted-foreground"/>
                                                                            <Select
                                                                                value={activeBus ? getBusIdentifier({ type: activeBus.type, busNumber: activeBus.busNumber }) : ''}
                                                                                onValueChange={(val) => {
                                                                                    const selectedBus = expandedBusList.find(b => getBusIdentifier({ type: b.type, busNumber: b.globalBusNum }) === val);
                                                                                    if (selectedBus) {
                                                                                        setActiveBus({ busNumber: selectedBus.globalBusNum, type: selectedBus.type });
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-[220px]">
                                                                                    <SelectValue placeholder="Seleccionar vehículo" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {expandedBusList.map(bus => (
                                                                                        <SelectItem key={bus.globalBusNum} value={getBusIdentifier({ type: bus.type, busNumber: bus.globalBusNum })}>
                                                                                          {bus.typeName} {getVehicleCount(tour) > 1 ? bus.instanceNum : ''}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    )}
                                                                </DialogHeader>
                                                                <div className="flex-1 overflow-y-auto">
                                                                    <div className="px-6 pb-4">
                                                                        {activeBus && (
                                                                          <SeatSelector
                                                                              vehicleType={activeBus.type}
                                                                              occupiedSeats={getOccupiedSeatsForTour(tour.id, activeBus.busNumber, res.id)}
                                                                              selectedSeats={res.assignedSeats.filter(s => s.bus === activeBus.busNumber).map(s => s.seatId)}
                                                                              onSeatSelect={(seatId) => handleSeatSelect(res.id, seatId, activeBus.busNumber)}
                                                                              passengerSeats={[]} 
                                                                              maxSeats={res.seatsCount}
                                                                          />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <DialogFooter className="p-6 pt-4 mt-auto border-t">
                                                                    <DialogClose asChild>
                                                                        <Button type="button">Cerrar</Button>
                                                                    </DialogClose>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Confirmado')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Confirmar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'Pendiente')}>
                                                            <Clock className="mr-2 h-4 w-4" />
                                                            Marcar como Pendiente
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleDelete(res.id)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                           </AccordionContent>
                       </AccordionItem>
                       )
                    })}
                </Accordion>
            )}
        </CardContent>
      </Card>
    </div>
  )
}

    

    