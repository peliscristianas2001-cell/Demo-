
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
import { MoreHorizontal, CheckCircle, Clock, Trash2, Armchair, Bus, Plane, Ship } from "lucide-react"
import { mockTours, mockReservations } from "@/lib/mock-data"
import type { Tour, Reservation, ReservationStatus, LayoutCategory, LayoutItemType } from "@/lib/types"
import { getLayoutConfig } from "@/lib/layout-config"

type ActiveTransportUnitInfo = {
  unitNumber: number;
  category: LayoutCategory;
  type: LayoutItemType;
} | null;

type ExpandedTransportUnit = {
    category: LayoutCategory;
    type: LayoutItemType;
    typeName: string;
    instanceNum: number;
    globalUnitNum: number;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tours, setTours] = useState<Tour[]>([]);
  const [activeUnit, setActiveUnit] = useState<ActiveTransportUnitInfo>(null);
  const [isClient, setIsClient] = useState(false)
  const [layoutConfig, setLayoutConfig] = useState(getLayoutConfig());

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
      setLayoutConfig(getLayoutConfig(true));
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

  const getExpandedTransportList = (tour: Tour): ExpandedTransportUnit[] => {
    const transportList: ExpandedTransportUnit[] = [];
    let globalUnitCounter = 1;
    const categories: LayoutCategory[] = ['vehicles', 'airplanes', 'cruises'];

    for (const category of categories) {
        if (tour[category]) {
            for (const [type, count] of Object.entries(tour[category]!)) {
                if (count && count > 0) {
                    for (let i = 1; i <= count; i++) {
                        transportList.push({
                            category: category,
                            type: type as LayoutItemType,
                            typeName: layoutConfig[category]?.[type as LayoutItemType]?.name || 'Unidad',
                            instanceNum: i,
                            globalUnitNum: globalUnitCounter
                        });
                        globalUnitCounter++;
                    }
                }
            }
        }
    }
    return transportList;
  }

  const getTransportCount = (tour: Tour) => {
    let totalCount = 0;
    const categories: LayoutCategory[] = ['vehicles', 'airplanes', 'cruises'];
    for (const category of categories) {
        if (tour[category]) {
            totalCount += Object.values(tour[category]!).reduce((total, count) => total + (count || 0), 0);
        }
    }
    return totalCount;
  }

  const handleStatusChange = (reservationId: string, newStatus: ReservationStatus) => {
    setReservations(reservations.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    ))
  }

  const handleDelete = (reservationId: string) => {
    setReservations(reservations.filter(res => res.id !== reservationId));
  }

  const handleSeatSelect = (reservationId: string, seatId: string, unitNumber: number) => {
    setReservations(prevReservations => {
        return prevReservations.map(res => {
            if (res.id === reservationId) {
                let newAssignedSeats = [...(res.assignedSeats || [])];
                const seatIndex = newAssignedSeats.findIndex(s => s.seatId === seatId && s.unit === unitNumber);

                if (seatIndex > -1) {
                    newAssignedSeats.splice(seatIndex, 1);
                } else {
                    if (newAssignedSeats.length < res.paxCount) {
                        newAssignedSeats.push({ seatId, unit: unitNumber });
                    }
                }
                return { ...res, assignedSeats: newAssignedSeats };
            }
            return res;
        });
    });
};

  const getOccupiedSeatsForTour = (tourId: string, unitNumber: number, currentReservationId: string) => {
    return reservations
      .filter(res => res.tripId === tourId && res.id !== currentReservationId)
      .flatMap(res => res.assignedSeats || [])
      .filter(seat => seat.unit === unitNumber)
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
  
  const getTransportIdentifier = (unit: ExpandedTransportUnit) => {
    return `${unit.category}_${unit.type}_${unit.globalUnitNum}`;
  }

  const handleDialogOpen = (tour: Tour) => {
    const unitList = getExpandedTransportList(tour);
    if (unitList.length > 0) {
      const firstUnit = unitList[0];
      setActiveUnit({ unitNumber: firstUnit.globalUnitNum, category: firstUnit.category, type: firstUnit.type });
    } else {
      setActiveUnit(null);
    }
  };
  
  const categoryIcons: Record<LayoutCategory, React.ElementType> = {
    vehicles: Bus,
    airplanes: Plane,
    cruises: Ship,
  }


  if (!isClient) {
    return null; 
  }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold">Gestión de Reservas</h2>
        <p className="text-muted-foreground">
          Visualiza las reservas, asigna asientos y gestiona los estados.
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
                       const expandedUnitList = getExpandedTransportList(tour);
                       const totalVehicleCount = expandedUnitList.length;

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
                                            const assignedCount = (res.assignedSeats?.length || 0) + (res.assignedCabins?.length || 0);
                                            return (
                                                <TableRow key={res.id}>
                                                    <TableCell>{res.passenger}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{assignedCount} / {res.paxCount}</Badge>
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
                                                              setActiveUnit(null);
                                                            }
                                                          }}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Armchair className="mr-2 h-4 w-4" /> Asignar
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
                                                                <DialogHeader className="p-6 pb-4">
                                                                    <DialogTitle>Asignar para {res.passenger}</DialogTitle>
                                                                    <DialogDescription>
                                                                        Viaje a {tour.destination}. Reservó {res.paxCount} lugares.
                                                                    </DialogDescription>
                                                                    {totalVehicleCount > 1 && activeUnit && (
                                                                        <div className="flex items-center gap-2 pt-2">
                                                                            <Bus className="w-5 h-5 text-muted-foreground"/>
                                                                            <Select
                                                                                value={activeUnit ? getTransportIdentifier(expandedUnitList.find(b => b.globalUnitNum === activeUnit.unitNumber)!) : ''}
                                                                                onValueChange={(val) => {
                                                                                    const selectedUnit = expandedUnitList.find(b => getTransportIdentifier(b) === val);
                                                                                    if (selectedUnit) {
                                                                                        setActiveUnit({ unitNumber: selectedUnit.globalUnitNum, category: selectedUnit.category, type: selectedUnit.type });
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-[280px]">
                                                                                    <SelectValue placeholder="Seleccionar unidad" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {expandedUnitList.map(unit => {
                                                                                        const Icon = categoryIcons[unit.category];
                                                                                        return (
                                                                                            <SelectItem key={unit.globalUnitNum} value={getTransportIdentifier(unit)}>
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <Icon className="w-4 h-4 text-muted-foreground"/>
                                                                                                    <span>{unit.typeName} {getTransportCount(tour) > 1 ? unit.instanceNum : ''}</span>
                                                                                                </div>
                                                                                            </SelectItem>
                                                                                        )
                                                                                    })}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    )}
                                                                </DialogHeader>
                                                                <div className="flex-1 overflow-y-auto">
                                                                    <div className="px-6 pb-4">
                                                                        {activeUnit && (
                                                                          <SeatSelector
                                                                              category={activeUnit.category}
                                                                              layoutType={activeUnit.type}
                                                                              occupiedSeats={getOccupiedSeatsForTour(tour.id, activeUnit.unitNumber, res.id)}
                                                                              selectedSeats={(res.assignedSeats || []).filter(s => s.unit === activeUnit.unitNumber).map(s => s.seatId)}
                                                                              onSeatSelect={(seatId) => handleSeatSelect(res.id, seatId, activeUnit.unitNumber)}
                                                                              maxSeats={res.paxCount}
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
