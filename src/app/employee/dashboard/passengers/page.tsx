
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
import { Input } from "@/components/ui/input"
import { Search, PlusCircle, MoreHorizontal, Edit, Trash2, UserPlus, Pencil } from "lucide-react"
import { mockPassengers, mockBoardingPoints } from "@/lib/mock-data"
import type { Passenger, BoardingPoint } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { PassengerForm } from "@/components/admin/passenger-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const calculateAge = (dob: Date | string) => {
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

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [boardingPoints, setBoardingPoints] = useState<BoardingPoint[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null)
  const [prefilledFamily, setPrefilledFamily] = useState<string | undefined>(undefined);
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast();
  
  useEffect(() => {
    setIsClient(true);
    const storedPassengers = localStorage.getItem("ytl_passengers");
    setPassengers(storedPassengers ? JSON.parse(storedPassengers) : mockPassengers);
    const storedBoardingPoints = localStorage.getItem("ytl_boarding_points");
    setBoardingPoints(storedBoardingPoints ? JSON.parse(storedBoardingPoints) : mockBoardingPoints);

     const handleStorageChange = () => {
        const newStoredPassengers = localStorage.getItem("ytl_passengers")
        setPassengers(newStoredPassengers ? JSON.parse(newStoredPassengers) : mockPassengers)
        const newStoredBoardingPoints = localStorage.getItem("ytl_boarding_points");
        setBoardingPoints(newStoredBoardingPoints ? JSON.parse(newStoredBoardingPoints) : mockBoardingPoints);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("ytl_passengers", JSON.stringify(passengers));
    }
  }, [passengers, isClient]);

  const handleEdit = (passenger: Passenger) => {
    setSelectedPassenger(passenger)
    setPrefilledFamily(undefined);
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedPassenger(null)
    setPrefilledFamily(undefined);
    setIsFormOpen(true)
  }

  const handleCreateInFamily = (familyName: string) => {
    setSelectedPassenger(null);
    setPrefilledFamily(familyName);
    setIsFormOpen(true);
  }

  const handleSave = (passengerData: Passenger) => {
    if (selectedPassenger) {
        setPassengers(passengers.map(p => p.id === passengerData.id ? passengerData : p))
        toast({ title: "Pasajero actualizado", description: "Los datos se guardaron correctamente." });
    } else {
        setPassengers([...passengers, { ...passengerData, id: `P-${Math.random().toString(36).substring(2, 11)}` }])
        toast({ title: "Pasajero creado", description: "El nuevo pasajero fue añadido al sistema." });
    }
    setIsFormOpen(false)
  }
  
  const handleDelete = (passengerId: string) => {
    setPassengers(passengers.filter(p => p.id !== passengerId));
    toast({ title: "Pasajero eliminado", variant: "destructive" });
  }

  const handleFamilyNameChange = (oldFamilyName: string, newFamilyName: string) => {
     if (!newFamilyName || oldFamilyName === newFamilyName) return;
     setPassengers(prev => 
        prev.map(p => {
            if (p.family === oldFamilyName) {
                return { ...p, family: newFamilyName };
            }
            return p;
        })
     );
     toast({ title: "Familia actualizada", description: `El grupo '${oldFamilyName}' ahora se llama '${newFamilyName}'.` });
  }

  const passengersByFamily = useMemo(() => {
    const filtered = passengers.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dni.includes(searchTerm) ||
        (p.family && p.family.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.reduce((acc, p) => {
        const familyKey = p.family || 'Sin familia asignada';
        if (!acc[familyKey]) {
            acc[familyKey] = [];
        }
        acc[familyKey].push(p);
        return acc;
    }, {} as Record<string, Passenger[]>);
  }, [passengers, searchTerm])
  
  if (!isClient) return null;

  return (
    <>
    <PassengerForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        passenger={selectedPassenger}
        prefilledFamily={prefilledFamily}
    />
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold">Gestión de Pasajeros</h2>
            <p className="text-muted-foreground">
            Añade, busca y administra la información de todos los pasajeros.
            </p>
        </div>
         <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Pasajero
        </Button>
      </div>
      <Card>
        <CardHeader>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nombre, DNI o familia..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full" defaultValue={Object.keys(passengersByFamily)}>
                {Object.entries(passengersByFamily).map(([family, members]) => (
                    <AccordionItem value={family} key={family}>
                        <AccordionTrigger className="text-lg font-medium group hover:no-underline">
                           <div className={cn("flex items-center gap-2", family === 'Sin familia asignada' && "w-full")}>
                                {family === 'Sin familia asignada' ? (
                                    <span className="text-lg font-medium">{family}</span>
                                ) : (
                                    <Input 
                                        defaultValue={family} 
                                        onBlur={(e) => handleFamilyNameChange(family, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-lg font-medium border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary p-1 h-auto"
                                    />
                                )}
                                {family !== 'Sin familia asignada' && <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                                <span>({members.length})</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <div className="space-y-4">
                                {family !== 'Sin familia asignada' && (
                                    <div className="flex justify-end">
                                        <Button variant="outline" size="sm" onClick={() => handleCreateInFamily(family)}>
                                            <UserPlus className="mr-2 h-4 w-4"/>
                                            Añadir Integrante
                                        </Button>
                                    </div>
                                )}
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre Completo</TableHead>
                                        <TableHead>DNI</TableHead>
                                        <TableHead>F. Nacimiento</TableHead>
                                        <TableHead>Teléfono</TableHead>
                                        <TableHead>Embarque</TableHead>
                                        <TableHead>Edad</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {members.map((p) => {
                                        const boardingPoint = boardingPoints.find(bp => bp.id === p.boardingPointId);
                                        return (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{p.fullName}</TableCell>
                                                <TableCell>{p.dni}</TableCell>
                                                <TableCell>{p.dob ? new Date(p.dob).toLocaleDateString('es-AR') : 'N/A'}</TableCell>
                                                <TableCell>{p.phone || 'N/A'}</TableCell>
                                                <TableCell>{boardingPoint?.name || 'N/A'}</TableCell>
                                                <TableCell>{p.dob ? calculateAge(p.dob) : 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(p)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    </TableBody>
                                </Table>
                             </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
