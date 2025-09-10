
"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Passenger, Seller, Reservation, PaymentStatus, Tour, BoardingPoint, RoomType } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/searchable-select"
import { PlusCircle, UserPlus, XCircle } from "lucide-react"
import { Checkbox } from "../ui/checkbox"
import { AddPassengerSubForm } from "./add-passenger-subform"
import { ScrollArea } from "../ui/scroll-area"

interface AddReservationFormProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (reservation: Reservation) => void
  tour: Tour
  passengers: Passenger[]
  allReservations: Reservation[]
  onPassengerCreated: (passenger: Passenger) => void
  sellers: Seller[]
  boardingPoints: BoardingPoint[]
  roomTypes: RoomType[]
}

const defaultReservation = {
    mainPassengerId: "",
    paxCount: 1,
    sellerId: "unassigned",
    finalPrice: 0,
    paymentStatus: "Pendiente" as PaymentStatus,
    selectedPassengerIds: [] as string[],
    boardingPointId: undefined,
    roomTypeId: undefined
}

export function AddReservationForm({ isOpen, onOpenChange, onSave, tour, passengers, allReservations, onPassengerCreated, sellers, boardingPoints, roomTypes }: AddReservationFormProps) {
  const [formData, setFormData] = useState(defaultReservation);
  const [isAddingNewPassenger, setIsAddingNewPassenger] = useState(false);
  const [mainPassengerSearch, setMainPassengerSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        setFormData({
            ...defaultReservation,
            finalPrice: tour.price // Default to base price
        });
        setMainPassengerSearch("");
        setIsAddingNewPassenger(false);
    }
  }, [isOpen, tour])

  const availablePassengers = useMemo(() => {
    const bookedPassengerIdsForThisTour = new Set(
      allReservations
        .filter(r => r.tripId === tour.id)
        .flatMap(r => r.passengerIds || [])
    );

    return passengers.filter(p => !bookedPassengerIdsForThisTour.has(p.id));
  }, [passengers, allReservations, tour.id]);


  const searchResults = useMemo(() => {
    if (!mainPassengerSearch) return [];
    const lowercasedTerm = mainPassengerSearch.toLowerCase();
    return availablePassengers.filter(p => 
        p.fullName.toLowerCase().includes(lowercasedTerm) || 
        p.dni.includes(lowercasedTerm)
    );
  }, [mainPassengerSearch, availablePassengers]);

  const sellerOptions = useMemo(() => {
    return sellers.map(s => ({
      value: s.id,
      label: s.name,
      keywords: [s.dni]
    }));
  }, [sellers]);


  const selectedMainPassenger = useMemo(() => {
    return passengers.find(p => p.id === formData.mainPassengerId);
  }, [formData.mainPassengerId, passengers]);
  
  const familyMembers = useMemo(() => {
    if (!selectedMainPassenger?.family) return [];
    const bookedPassengerIdsForThisTour = new Set(
      allReservations
        .filter(r => r.tripId === tour.id)
        .flatMap(r => r.passengerIds || [])
    );
    return passengers.filter(p => p.family === selectedMainPassenger.family && !bookedPassengerIdsForThisTour.has(p.id));
  }, [selectedMainPassenger, passengers, allReservations, tour.id]);


  const handleFormChange = (id: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  const handleMainPassengerSelect = (passenger: Passenger) => {
    setFormData(prev => ({
        ...prev,
        mainPassengerId: passenger.id,
        selectedPassengerIds: [passenger.id],
        paxCount: 1,
        boardingPointId: passenger.boardingPointId,
    }));
    setMainPassengerSearch(passenger.fullName);
  }

  const handleMemberSelect = (passengerId: string, checked: boolean) => {
     setFormData(prev => {
        const currentSelection = prev.selectedPassengerIds;
        let newSelection;
        if (checked) {
            newSelection = [...currentSelection, passengerId];
        } else {
            newSelection = currentSelection.filter(id => id !== passengerId);
        }
        return { ...prev, selectedPassengerIds: newSelection };
     });
  }
  
  const handleAddNewPassenger = (newPassengerData: Omit<Passenger, 'id'>, isMain: boolean) => {
    const newPassenger: Passenger = {
      ...newPassengerData,
      id: `P-${Math.random().toString(36).substring(2, 11)}`,
      family: selectedMainPassenger?.family || `Familia ${newPassengerData.fullName.split(' ').pop()}`,
      nationality: 'Argentina',
      tierId: 'adult'
    };
    onPassengerCreated(newPassenger);
    
    if (isMain) {
        handleMainPassengerSelect(newPassenger);
        setIsAddingNewPassenger(false);
    } else {
        setFormData(prev => ({
            ...prev,
            selectedPassengerIds: [...prev.selectedPassengerIds, newPassenger.id]
        }));
    }
  };


  const handleSubmit = () => {
    if (!selectedMainPassenger) {
        toast({ title: "Faltan datos", description: "Por favor, selecciona un pasajero principal.", variant: "destructive" });
        return;
    }
    if(formData.selectedPassengerIds.length !== formData.paxCount) {
        toast({ title: "Verificar pasajeros", description: "La cantidad de pasajeros seleccionados no coincide con la cantidad de pasajeros de la reserva.", variant: "destructive" });
        return;
    }
    
    const reservationToSave: Reservation = {
        id: `YTL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        tripId: tour.id,
        passenger: selectedMainPassenger.fullName,
        passengerIds: formData.selectedPassengerIds,
        paxCount: formData.selectedPassengerIds.length,
        assignedSeats: [],
        assignedCabins: [],
        status: 'Pendiente',
        paymentStatus: formData.paymentStatus,
        sellerId: formData.sellerId,
        finalPrice: formData.finalPrice,
        boardingPointId: formData.boardingPointId,
        roomTypeId: formData.roomTypeId,
    }

    onSave(reservationToSave);
  }

  const canSubmit = formData.paxCount === formData.selectedPassengerIds.length && formData.mainPassengerId;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Agregar Reserva a {tour.destination}</DialogTitle>
          <DialogDescription>
            Busca un pasajero principal y completa los detalles de la reserva.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <div className="py-4 space-y-4">
                <div className="space-y-2 relative">
                    <Label htmlFor="passenger-search">Pasajero Principal</Label>
                    <Input
                        id="passenger-search"
                        value={mainPassengerSearch}
                        onChange={e => setMainPassengerSearch(e.target.value)}
                        placeholder="Buscar por nombre o DNI..."
                        disabled={!!selectedMainPassenger}
                    />
                    {selectedMainPassenger && (
                        <Button variant="ghost" size="icon" className="absolute top-6 right-0" onClick={() => {
                            setMainPassengerSearch("");
                            setFormData(prev => ({...prev, mainPassengerId: "", selectedPassengerIds: []}))
                        }}>
                            <XCircle className="w-5 h-5 text-muted-foreground"/>
                        </Button>
                    )}
                    {mainPassengerSearch && !selectedMainPassenger && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                            {searchResults.map(p => (
                                <div key={p.id} className="p-2 hover:bg-accent cursor-pointer" onClick={() => handleMainPassengerSelect(p)}>
                                    {p.fullName} ({p.dni})
                                </div>
                            ))}
                        </div>
                    )}
                    {mainPassengerSearch && !selectedMainPassenger && searchResults.length === 0 && !isAddingNewPassenger && (
                        <div className="text-center p-4 border-dashed border-2 rounded-md">
                            <p className="text-sm text-muted-foreground mb-2">No se encontró al pasajero.</p>
                            <Button onClick={() => setIsAddingNewPassenger(true)}>
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Registrar Nuevo Pasajero Principal
                            </Button>
                        </div>
                    )}
                </div>

                {isAddingNewPassenger && !selectedMainPassenger && (
                    <div className="p-4 border rounded-lg bg-secondary/30">
                        <DialogHeader className="mb-4">
                            <DialogTitle>Registrar Nuevo Pasajero Principal</DialogTitle>
                        </DialogHeader>
                        <AddPassengerSubForm onSave={(data) => handleAddNewPassenger(data, true)} onCancel={() => setIsAddingNewPassenger(false)} />
                    </div>
                )}
                
                {selectedMainPassenger && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paxCount">Cantidad de Pasajeros</Label>
                                <Input id="paxCount" type="number" min="1" value={formData.paxCount} onChange={(e) => handleFormChange('paxCount', parseInt(e.target.value) || 1)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="finalPrice">Precio Final (Total)</Label>
                                <Input id="finalPrice" type="number" value={formData.finalPrice} onChange={(e) => handleFormChange('finalPrice', parseFloat(e.target.value) || 0)} />
                            </div>
                        </div>
                        
                        <div className="p-4 border rounded-md space-y-3">
                            <div className="flex justify-between items-center">
                                <Label>Integrantes del Viaje ({formData.selectedPassengerIds.length}/{formData.paxCount})</Label>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Añadir Nuevo
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Añadir Nuevo Integrante</DialogTitle>
                                            <DialogDescription>
                                                El nuevo pasajero se agregará al grupo familiar de {selectedMainPassenger.family || 'la reserva'}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <AddPassengerSubForm onSave={(data) => handleAddNewPassenger(data, false)} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <ScrollArea className="h-40">
                                <div className="space-y-2 pr-2">
                                    {familyMembers.map(member => (
                                        <div key={member.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                                            <Checkbox
                                                id={`member-${member.id}`}
                                                checked={formData.selectedPassengerIds.includes(member.id)}
                                                onCheckedChange={(checked) => handleMemberSelect(member.id, !!checked)}
                                                disabled={member.id === selectedMainPassenger.id}
                                            />
                                            <Label htmlFor={`member-${member.id}`} className="font-normal flex-1 cursor-pointer">
                                                {member.fullName} <span className="text-muted-foreground"> (DNI: {member.dni})</span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="seller">Vendedor/a</Label>
                                <SearchableSelect
                                    options={sellerOptions}
                                    value={formData.sellerId}
                                    onChange={(value) => handleFormChange('sellerId', value)}
                                    placeholder="Buscar vendedor..."
                                    listHeight="h-32"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentStatus">Estado de Pago</Label>
                                <Select value={formData.paymentStatus} onValueChange={(val: PaymentStatus) => handleFormChange('paymentStatus', val)}>
                                    <SelectTrigger id="paymentStatus"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                                        <SelectItem value="Parcial">Parcial</SelectItem>
                                        <SelectItem value="Pagado">Pagado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="roomTypeId">Tipo de Habitación</Label>
                            <Select value={formData.roomTypeId} onValueChange={(val) => handleFormChange('roomTypeId', val)}>
                                <SelectTrigger id="roomTypeId"><SelectValue placeholder="Seleccionar habitación..."/></SelectTrigger>
                                <SelectContent>
                                    {roomTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="boardingPointId">Punto de Embarque</Label>
                            <Select value={formData.boardingPointId} onValueChange={(val) => handleFormChange('boardingPointId', val)}>
                                <SelectTrigger id="boardingPointId"><SelectValue placeholder="Seleccionar embarque..."/></SelectTrigger>
                                <SelectContent>
                                    {boardingPoints.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}
            </div>
        </div>
        
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>Guardar Reserva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
