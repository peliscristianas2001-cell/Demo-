
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { SeatSelector } from "@/components/booking/seat-selector"
import { MoreHorizontal, CheckCircle, Clock, Trash2, Armchair, Bus, Plane, Ship, Edit, UserPlus, CreditCard, Users, Info, Calendar, MapPin, DollarSign, Home, Tag, ShieldCheck, Utensils, BedDouble } from "lucide-react"
import { mockTours, mockReservations, mockSellers, mockPassengers } from "@/lib/mock-data"
import type { Tour, Reservation, ReservationStatus, LayoutCategory, LayoutItemType, Seller, PaymentStatus, Passenger, BoardingPoint } from "@/lib/types"
import { getLayoutConfig } from "@/lib/layout-config"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AddReservationForm } from "@/components/admin/add-reservation-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

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

type EditReservationState = {
  isOpen: boolean;
  reservation: Reservation | null;
}

type AddReservationState = {
    isOpen: boolean;
    tour: Tour | null;
}

const calculateAge = (dob: Date | string | undefined) => {
    if (!dob) return null;
    const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tours, setTours] = useState<Tour[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [boardingPoints, setBoardingPoints] = useState<BoardingPoint[]>([]);
  const [activeUnit, setActiveUnit] = useState<ActiveTransportUnitInfo>(null);
  const [isClient, setIsClient] = useState(false)
  const [layoutConfig, setLayoutConfig] = useState(getLayoutConfig());
  const [editingReservation, setEditingReservation] = useState<EditReservationState>({ isOpen: false, reservation: null });
  const [addingReservation, setAddingReservation] = useState<AddReservationState>({ isOpen: false, tour: null });


  useEffect(() => {
    setIsClient(true)
    // Load data from localStorage or fall back to mock data
    const storedReservations = localStorage.getItem("ytl_reservations")
    const storedTours = localStorage.getItem("ytl_tours")
    const storedSellers = localStorage.getItem("ytl_sellers")
    const storedPassengers = localStorage.getItem("ytl_passengers")
    const storedBoardingPoints = localStorage.getItem("ytl_boarding_points")
    
    setReservations(storedReservations ? JSON.parse(storedReservations) : mockReservations)
    setTours(storedTours ? JSON.parse(storedTours) : mockTours)
    setSellers(storedSellers ? JSON.parse(storedSellers) : mockSellers)
    setPassengers(storedPassengers ? JSON.parse(storedPassengers) : mockPassengers)
    setBoardingPoints(storedBoardingPoints ? JSON.parse(storedBoardingPoints) : [])

    const handleStorageChange = () => {
      setLayoutConfig(getLayoutConfig(true));
       const newStoredReservations = localStorage.getItem("ytl_reservations")
       const newStoredTours = localStorage.getItem("ytl_tours")
       const newStoredSellers = localStorage.getItem("ytl_sellers")
       const newStoredPassengers = localStorage.getItem("ytl_passengers")
       const newStoredBoardingPoints = localStorage.getItem("ytl_boarding_points")
       setReservations(newStoredReservations ? JSON.parse(newStoredReservations) : mockReservations)
       setTours(newStoredTours ? JSON.parse(newStoredTours) : mockTours)
       setSellers(newStoredSellers ? JSON.parse(newStoredSellers) : mockSellers)
       setPassengers(newStoredPassengers ? JSON.parse(newStoredPassengers) : mockPassengers)
       setBoardingPoints(newStoredBoardingPoints ? JSON.parse(newStoredBoardingPoints) : [])
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])

  useEffect(() => {
    if (isClient) {
        localStorage.setItem("ytl_reservations", JSON.stringify(reservations));
    }
  }, [reservations, isClient])

  // Effect to update local passenger list when a new one is added from the sub-form
  useEffect(() => {
    if (isClient) {
        localStorage.setItem("ytl_passengers", JSON.stringify(passengers));
    }
  }, [passengers, isClient]);

  const reservationsByTrip = useMemo(() => {
    return tours.reduce((acc, tour) => {
        const tripReservations = reservations.filter(res => res.tripId === tour.id);
        if (tripReservations.length > 0) {
            acc[tour.id] = {
                tour,
                reservations: tripReservations
            };
        } else {
             // Still include the tour even if it has no reservations
            acc[tour.id] = { tour, reservations: [] };
        }
        return acc;
    }, {} as Record<string, { tour: Tour, reservations: Reservation[] }>);
  }, [reservations, tours]);

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
  
  const handleAddReservation = (newReservation: Reservation) => {
    setReservations(prev => [...prev, newReservation]);
    setAddingReservation({ isOpen: false, tour: null });
  }

  const handleUpdateReservation = () => {
    if (!editingReservation.reservation) return;
    setReservations(prev => prev.map(res => res.id === editingReservation.reservation!.id ? editingReservation.reservation! : res));
    setEditingReservation({isOpen: false, reservation: null});
  }

  const handleDelete = (reservationId: string) => {
    setReservations(reservations.filter(res => res.id !== reservationId));
  }

  const handleAssignment = (reservationId: string, assignmentId: string, unitNumber: number, type: 'seat' | 'cabin') => {
      const updatedReservations = reservations.map(res => {
          if (res.id !== reservationId) return res;

          let updatedRes = { ...res };
          let currentAssignments, maxAssignments;

          if (type === 'seat') {
              updatedRes.assignedSeats = updatedRes.assignedSeats || [];
              const isAlreadyAssigned = updatedRes.assignedSeats.some(s => s.seatId === assignmentId && s.unit === unitNumber);
              
              if (isAlreadyAssigned) {
                  updatedRes.assignedSeats = updatedRes.assignedSeats.filter(s => !(s.seatId === assignmentId && s.unit === unitNumber));
              } else {
                   const totalAssignments = (updatedRes.assignedSeats.length || 0) + (updatedRes.assignedCabins?.length || 0);
                   if (totalAssignments < updatedRes.paxCount) {
                        updatedRes.assignedSeats.push({ seatId: assignmentId, unit: unitNumber });
                   }
              }
          } else if (type === 'cabin') {
               updatedRes.assignedCabins = updatedRes.assignedCabins || [];
               const isAlreadyAssigned = updatedRes.assignedCabins.some(c => c.cabinId === assignmentId && c.unit === unitNumber);

               if (isAlreadyAssigned) {
                  updatedRes.assignedCabins = updatedRes.assignedCabins.filter(c => !(c.cabinId === assignmentId && c.unit === unitNumber));
               } else {
                   const totalAssignments = (updatedRes.assignedSeats?.length || 0) + (updatedRes.assignedCabins?.length || 0);
                   if (totalAssignments < updatedRes.paxCount) {
                       updatedRes.assignedCabins.push({ cabinId: assignmentId, unit: unitNumber });
                   }
               }
          }
          return updatedRes;
      });
      
      setReservations(updatedReservations);

      setEditingReservation(prev => {
        if (!prev.reservation || prev.reservation.id !== reservationId) return prev;
        const updatedInDialog = updatedReservations.find(r => r.id === reservationId);
        return {
          ...prev,
          reservation: updatedInDialog || prev.reservation,
        };
      });
  };

  const getOccupiedForTour = (tourId: string, unitNumber: number, currentReservationId: string) => {
    const occupiedSeats = reservations
      .filter(res => res.tripId === tourId && res.id !== currentReservationId)
      .flatMap(res => res.assignedSeats || [])
      .filter(seat => seat.unit === unitNumber)
      .map(seat => seat.seatId);
      
    const occupiedCabins = reservations
      .filter(res => res.tripId === tourId && res.id !== currentReservationId)
      .flatMap(res => res.assignedCabins || [])
      .filter(cabin => cabin.unit === unitNumber)
      .map(cabin => cabin.cabinId);
      
    return { occupiedSeats, occupiedCabins };
  };
  
  const getTransportIdentifier = (unit: ExpandedTransportUnit) => {
    return `${unit.category}_${unit.type}_${unit.globalUnitNum}`;
  }

  const handleDialogOpen = (tour: Tour, reservation: Reservation) => {
    setEditingReservation({ isOpen: true, reservation });
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

  const renderDialogContent = () => {
    if (!editingReservation.reservation) return null;
    
    const reservation = editingReservation.reservation;
    const tour = tours.find(t => t.id === reservation.tripId);
    
    if (!tour) return null;

    const installments = reservation.installments || { count: 1, details: [{ amount: reservation.finalPrice, isPaid: false }] };
    const paidAmount = installments.details.reduce((sum, inst) => inst.isPaid ? sum + inst.amount : sum, 0);
    const balance = reservation.finalPrice - paidAmount;
    const unitList = getExpandedTransportList(tour);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-2">
        {/* Columna Izquierda: Edición de Datos */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5"/> Datos de Pago</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalPrice">Precio Final</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  value={reservation.finalPrice}
                  onChange={(e) => setEditingReservation(prev => ({...prev, reservation: {...prev.reservation!, finalPrice: parseFloat(e.target.value) || 0}}))}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="installments-count">Cantidad de Cuotas</Label>
                <Input
                  id="installments-count"
                  type="number"
                  min="1"
                  value={installments.count}
                  onChange={(e) => {
                      const newCount = parseInt(e.target.value) || 1;
                      const newDetails = Array.from({ length: newCount }, (_, i) => installments.details[i] || { amount: 0, isPaid: false });
                      setEditingReservation(prev => ({...prev, reservation: {...prev.reservation!, installments: { count: newCount, details: newDetails }}}))
                  }}
                />
              </div>
              <div className="space-y-3">
                  <Label>Detalle de Cuotas</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {installments.details.map((inst, index) => (
                       <div key={index} className="flex items-center gap-2">
                          <Label className="w-20">Cuota {index + 1}</Label>
                          <Input type="number" value={inst.amount || ''} onChange={(e) => {
                            const newDetails = [...installments.details];
                            newDetails[index].amount = parseFloat(e.target.value) || 0;
                            setEditingReservation(prev => ({...prev, reservation: {...prev.reservation!, installments: { ...installments, details: newDetails }}}))
                          }}/>
                          <Checkbox checked={inst.isPaid} onCheckedChange={(checked) => {
                             const newDetails = [...installments.details];
                             newDetails[index].isPaid = !!checked;
                             setEditingReservation(prev => ({...prev, reservation: {...prev.reservation!, installments: { ...installments, details: newDetails }}}))
                          }}/>
                          <Label>Pagada</Label>
                       </div>
                    ))}
                  </div>
              </div>
              <div className="flex justify-between font-semibold p-2 bg-muted rounded-md">
                 <span>Saldo Pendiente:</span>
                 <span>${balance.toLocaleString('es-AR')}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
              <CardHeader><CardTitle>Detalles Adicionales</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="boardingPointId">Punto de Embarque</Label>
                    <Select
                        value={reservation.boardingPointId}
                        onValueChange={(val) => setEditingReservation(prev => ({...prev, reservation: {...prev.reservation!, boardingPointId: val}}))}
                    >
                        <SelectTrigger id="boardingPointId"><SelectValue placeholder="Seleccionar embarque..."/></SelectTrigger>
                        <SelectContent>
                            {boardingPoints.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Asignación de Asientos */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignación de Lugares</CardTitle>
              <CardDescription>Reserva para {reservation.paxCount} pasajeros.</CardDescription>
               {activeUnit && unitList.length > 1 && (
                 <div className="flex items-center gap-2 pt-2">
                      <Bus className="w-5 h-5 text-muted-foreground"/>
                      <Select
                          value={activeUnit ? getTransportIdentifier(unitList.find(b => b.globalUnitNum === activeUnit.unitNumber)!) : ''}
                          onValueChange={(val) => {
                              const selectedUnit = unitList.find(b => getTransportIdentifier(b) === val);
                              if (selectedUnit) {
                                  setActiveUnit({ unitNumber: selectedUnit.globalUnitNum, category: selectedUnit.category, type: selectedUnit.type });
                              }
                          }}
                      >
                          <SelectTrigger className="w-[280px]">
                              <SelectValue placeholder="Seleccionar unidad" />
                          </SelectTrigger>
                          <SelectContent>
                              {unitList.map(unit => {
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
            </CardHeader>
            <CardContent>
              {activeUnit && (
                <SeatSelector
                    category={activeUnit.category}
                    layoutType={activeUnit.type}
                    occupiedSeats={getOccupiedForTour(reservation.tripId, activeUnit.unitNumber, reservation.id).occupiedSeats}
                    occupiedCabins={getOccupiedForTour(reservation.tripId, activeUnit.unitNumber, reservation.id).occupiedCabins}
                    selectedSeats={(editingReservation.reservation?.assignedSeats || []).filter(s => s.unit === activeUnit.unitNumber).map(s => String(s.seatId))}
                    selectedCabins={(editingReservation.reservation?.assignedCabins || []).filter(c => c.unit === activeUnit.unitNumber).map(c => String(c.cabinId))}
                    onAssignment={(id, type) => handleAssignment(reservation!.id, id, activeUnit.unitNumber, type)}
                    maxAssignments={reservation.paxCount}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };


  return (
    <>
    {addingReservation.tour && (
         <AddReservationForm 
            isOpen={addingReservation.isOpen}
            onOpenChange={(open) => setAddingReservation({ isOpen: open, tour: open ? addingReservation.tour : null })}
            onSave={handleAddReservation}
            tour={addingReservation.tour}
            passengers={passengers}
            allReservations={reservations}
            onPassengerCreated={(newPassenger) => setPassengers(prev => [...prev, newPassenger])}
            sellers={sellers}
            boardingPoints={boardingPoints}
        />
    )}

    <Dialog open={editingReservation.isOpen} onOpenChange={(open) => setEditingReservation({ isOpen: open, reservation: open ? editingReservation.reservation : null })}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-4xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Gestionar Reserva</DialogTitle>
          <DialogDescription>
            Modificar detalles de la reserva para {editingReservation.reservation?.passenger} en el viaje a {tours.find(t => t.id === editingReservation.reservation?.tripId)?.destination}.
          </DialogDescription>
        </DialogHeader>
        {renderDialogContent()}
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="destructive" className="mr-auto" onClick={() => {
              if (editingReservation.reservation) handleDelete(editingReservation.reservation.id);
              setEditingReservation({isOpen: false, reservation: null});
            }}>
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Reserva
            </Button>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleUpdateReservation}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


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
                    No hay viajes activos con reservas.
                </div>
            ) : (
                <Accordion type="multiple" className="w-full space-y-4" defaultValue={Object.keys(reservationsByTrip)}>
                    {Object.values(reservationsByTrip).map(({ tour, reservations: tripReservations }) => {
                       return (
                       <AccordionItem value={tour.id} key={tour.id} className="border-b-0">
                           <AccordionTrigger className="text-lg font-medium hover:no-underline bg-muted/50 px-4 rounded-t-lg">
                               {tour.destination} ({tripReservations.length} reservas)
                            </AccordionTrigger>
                           <AccordionContent className="p-0">
                                <div className="flex justify-end p-4 border-x border-b rounded-b-lg">
                                    <Button onClick={() => setAddingReservation({isOpen: true, tour: tour})}>
                                        <UserPlus className="mr-2 h-4 w-4"/>
                                        Agregar Reserva
                                    </Button>
                                </div>
                               {tripReservations.length > 0 ? (
                                <div className="space-y-2 mt-4">
                                {tripReservations.map((res) => {
                                    const resPassengers = passengers.filter(p => (res.passengerIds || []).includes(p.id));
                                    const mainPassenger = resPassengers[0];
                                    const seller = sellers.find(s => s.id === res.sellerId);
                                    const boardingPoint = boardingPoints.find(bp => bp.id === res.boardingPointId);
                                    const assignedLocations = [
                                        ...(res.assignedSeats || []).map(s => s.seatId),
                                        ...(res.assignedCabins || []).map(c => c.cabinId)
                                    ].join(', ');

                                    return (
                                        <Accordion key={res.id} type="single" collapsible>
                                            <AccordionItem value={res.id} className="border rounded-lg">
                                                <AccordionTrigger className="px-4 hover:no-underline text-base">
                                                    <div className="flex items-center gap-4">
                                                        <span>{res.passenger}</span>
                                                        <Badge variant={res.status === 'Confirmado' ? 'secondary' : 'outline'}>{res.status}</Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4 bg-secondary/20 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {/* Passenger Info */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle className="text-lg flex items-center gap-2">
                                                                    <Users className="w-5 h-5 text-primary"/>
                                                                    Pasajero Principal
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-3 text-sm">
                                                                <InfoRow label="Nombre" value={mainPassenger?.fullName}/>
                                                                <InfoRow label="DNI" value={mainPassenger?.dni}/>
                                                                <InfoRow label="F. Nac." value={mainPassenger?.dob ? new Date(mainPassenger.dob).toLocaleDateString() : 'N/A'}/>
                                                                <InfoRow label="Edad" value={calculateAge(mainPassenger?.dob)}/>
                                                                <InfoRow label="Grupo" value={mainPassenger?.family}/>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Reservation Info */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle className="text-lg flex items-center gap-2">
                                                                    <Tag className="w-5 h-5 text-primary"/>
                                                                    Detalles de Reserva
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-3 text-sm">
                                                                <InfoRow label="Cantidad" value={`${res.paxCount} pasajero(s)`}/>
                                                                <InfoRow label="Embarque" value={boardingPoint?.name}/>
                                                                <InfoRow label="Ubicación" value={assignedLocations}/>
                                                                <InfoRow label="Vendedor/a" value={seller?.name}/>
                                                                <InfoRow label="A Pagar" value={res.finalPrice ? `$${res.finalPrice.toLocaleString()}` : 'N/A'}/>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Trip Info */}
                                                         <Card>
                                                            <CardHeader>
                                                                <CardTitle className="text-lg flex items-center gap-2">
                                                                    <Home className="w-5 h-5 text-primary"/>
                                                                    Detalles del Viaje
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-3 text-sm">
                                                                <InfoRow label="Seguro" value={tour.insurance?.active ? 'Sí' : 'No'} icon={<ShieldCheck className="w-4 h-4 text-green-600"/>}/>
                                                                <InfoRow label="Pensión" value={tour.pension?.active ? tour.pension.type : 'No'} icon={<Utensils className="w-4 h-4 text-orange-600"/>}/>
                                                                <InfoRow label="Rooming" value={tour.roomType} icon={<BedDouble className="w-4 h-4 text-blue-600"/>}/>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                     <div className="flex justify-end gap-2 mt-4">
                                                        <Button variant="outline" size="sm" onClick={() => handleDialogOpen(tour, res)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Gestionar
                                                        </Button>
                                                     </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    )
                                })}
                                </div>
                               ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No hay reservas para este viaje aún.
                                </div>
                               )}
                           </AccordionContent>
                       </AccordionItem>
                       )
                    })}
                </Accordion>
            )}
        </CardContent>
      </Card>
    </div>
    </>
  )
}

const InfoRow = ({ label, value, icon }: { label: string, value: string | number | null | undefined, icon?: React.ReactNode}) => (
    <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            {icon}
            <p className="text-muted-foreground font-medium">{label}</p>
        </div>
        <p className="font-semibold text-right truncate">{value || 'N/A'}</p>
    </div>
)
    

    

    

    

    
