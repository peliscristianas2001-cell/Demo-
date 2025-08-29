

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
import type { Passenger, Seller, Reservation, PaymentStatus, Tour, BoardingPoint } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "../ui/checkbox"
import { AddPassengerSubForm } from "./add-passenger-subform"

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
}

const defaultReservation = {
    mainPassengerId: "",
    paxCount: 1,
    sellerId: "unassigned",
    finalPrice: 0,
    paymentStatus: "Pendiente" as PaymentStatus,
    selectedPassengerIds: [] as string[],
    boardingPointId: undefined
}

export function AddReservationForm({ isOpen, onOpenChange, onSave, tour, passengers, allReservations, onPassengerCreated, sellers, boardingPoints }: AddReservationFormProps) {
  const [formData, setFormData] = useState(defaultReservation);
  const [isAddingNewPassenger, setIsAddingNewPassenger] = useState(false);
  const [passengerPopoverOpen, setPassengerPopoverOpen] = useState(false);
  const [sellerPopoverOpen, setSellerPopoverOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        setFormData({
            ...defaultReservation,
            finalPrice: tour.price // Default to base price
        });
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

  const handleMainPassengerSelect = (passengerId: string) => {
    const passenger = passengers.find(p => p.id === passengerId);
    if (!passenger) return;

    setFormData(prev => ({
        ...prev,
        mainPassengerId: passengerId,
        selectedPassengerIds: [passengerId],
        paxCount: 1,
        boardingPointId: passenger.boardingPointId,
    }));
    setPassengerPopoverOpen(false);
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
  
  const handleAddNewPassenger = (newPassengerData: Omit<Passenger, 'id'>) => {
    const newPassenger: Passenger = {
      ...newPassengerData,
      id: `P-${Math.random().toString(36).substring(2, 11)}`,
      family: selectedMainPassenger?.family || `Familia ${newPassengerData.fullName.split(' ').pop()}`,
      nationality: 'Argentina',
      tierId: 'adult'
    };
    onPassengerCreated(newPassenger);
    setFormData(prev => ({
        ...prev,
        selectedPassengerIds: [...prev.selectedPassengerIds, newPassenger.id]
    }));
    setIsAddingNewPassenger(false);
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
        
        <div className="flex-1 overflow-y-auto pr-6 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="passenger">Pasajero Principal</Label>
                <Popover open={passengerPopoverOpen} onOpenChange={setPassengerPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={passengerPopoverOpen}
                            className="w-full justify-between"
                        >
                            {selectedMainPassenger
                                ? `${selectedMainPassenger.fullName} (DNI: ${selectedMainPassenger.dni})`
                                : "Seleccionar pasajero..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar pasajero por nombre o DNI..." />
                            <CommandList>
                                <CommandEmpty>No se encontró ningún pasajero.</CommandEmpty>
                                <CommandGroup>
                                    {availablePassengers.map((passenger) => (
                                        <CommandItem
                                            key={passenger.id}
                                            value={`${passenger.fullName} ${passenger.dni}`}
                                            onSelect={() => handleMainPassengerSelect(passenger.id)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    formData.mainPassengerId === passenger.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div>
                                                <p>{passenger.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{passenger.dni}</p>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            
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
                             <Dialog open={isAddingNewPassenger} onOpenChange={setIsAddingNewPassenger}>
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
                                    <AddPassengerSubForm onSave={handleAddNewPassenger} />
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
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
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="seller">Vendedor/a</Label>
                            <Popover open={sellerPopoverOpen} onOpenChange={setSellerPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={sellerPopoverOpen}
                                        className="w-full justify-between"
                                    >
                                        {formData.sellerId && formData.sellerId !== 'unassigned'
                                            ? sellers.find((seller) => seller.id === formData.sellerId)?.name
                                            : "Seleccionar vendedor..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar vendedor..." />
                                        <CommandList>
                                            <CommandEmpty>No se encontró ningún vendedor.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="unassigned"
                                                    onSelect={() => {
                                                        handleFormChange('sellerId', 'unassigned');
                                                        setSellerPopoverOpen(false);
                                                    }}
                                                >
                                                     <Check className={cn("mr-2 h-4 w-4", formData.sellerId === 'unassigned' ? "opacity-100" : "opacity-0")}/>
                                                     Sin asignar
                                                </CommandItem>
                                                {sellers.map((seller) => (
                                                    <CommandItem
                                                        value={seller.name}
                                                        key={seller.id}
                                                        onSelect={() => {
                                                            handleFormChange('sellerId', seller.id);
                                                            setSellerPopoverOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn("mr-2 h-4 w-4", formData.sellerId === seller.id ? "opacity-100" : "opacity-0")}
                                                        />
                                                        {seller.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
        
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>Guardar Reserva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
