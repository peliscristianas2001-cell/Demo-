
"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { mockTours, mockPassengers, mockReservations, mockSellers, mockBoardingPoints } from "@/lib/mock-data"
import type { Tour, Passenger, Reservation, Seller, BoardingPoint, Installment, PricingTier } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { CheckCircle, InfoIcon, Loader2, UploadCloud, Calendar as CalendarIcon, Save } from "lucide-react"
import { DatePicker } from "../ui/date-picker"

interface TemplateImporterProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

type ImportResult = {
    newTours: number;
    newReservations: number;
    newPassengers: number;
    updatedPassengers: number;
    createdTripId?: string;
    preselectedMonth?: number;
} | null;


const monthMap: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
};

// Function to convert Excel serial date to JS Date
const excelDateToJSDate = (serial: number) => {
   if (typeof serial !== 'number') return undefined;
   const utc_days  = Math.floor(serial - 25569);
   const utc_value = utc_days * 86400;                                        
   const date_info = new Date(utc_value * 1000);
   return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}


export function TemplateImporter({ isOpen, onOpenChange }: TemplateImporterProps) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult>(null);
    const [newTripDate, setNewTripDate] = useState<Date | undefined>();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setImportResult(null);
            setNewTripDate(undefined);
        }
    }

    const handleImport = async () => {
        if (!file) {
            toast({ title: "No se seleccionó ningún archivo", variant: "destructive" });
            return;
        }
        setIsLoading(true);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const header: string[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "A6:AH6" })[0] || [];
            const colMap: Record<string, number> = header.reduce((acc, curr, i) => {
                if (curr) acc[curr.trim().toUpperCase()] = i;
                return acc;
            }, {} as Record<string, number>);

            const passengerData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "A7:AH67" });
            const pricingData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "AZ179:BA184" });
            
            const tours: Tour[] = JSON.parse(localStorage.getItem("ytl_tours") || JSON.stringify(mockTours));
            let passengers: Passenger[] = JSON.parse(localStorage.getItem("ytl_passengers") || JSON.stringify(mockPassengers));
            let reservations: Reservation[] = JSON.parse(localStorage.getItem("ytl_reservations") || JSON.stringify(mockReservations));
            const sellers: Seller[] = JSON.parse(localStorage.getItem("ytl_sellers") || JSON.stringify(mockSellers));
            
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const nameParts = fileName.split(' ');
            const monthWord = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
            const detectedMonth = monthMap[monthWord];
            const tripName = typeof detectedMonth !== 'undefined' ? nameParts.slice(0, -1).join(' ') : fileName;

            let trip = tours.find(t => t.destination.toLowerCase() === tripName.toLowerCase());
            let newTourCreated = false;
            if (!trip) {
                const newPricingTiers: PricingTier[] = pricingData.map((row: any[], index: number) => ({
                    id: `T-imported-${index}`,
                    name: row[0] || 'Desconocido',
                    price: parseFloat(row[1]) || 0
                })).filter(tier => tier.name !== 'Desconocido' && tier.price > 0);
                
                const basePrice = newPricingTiers.find(t => t.name.toUpperCase() === 'ADULTO')?.price || 0;

                trip = {
                    id: `T-${Date.now()}`,
                    destination: tripName,
                    price: basePrice,
                    flyerUrl: 'https://placehold.co/400x500.png',
                    flyerType: 'image',
                    date: new Date(), 
                    pricingTiers: newPricingTiers
                };
                newTourCreated = true;
            }

            let resultCounts = { newTours: 0, newReservations: 0, newPassengers: 0, updatedPassengers: 0, createdTripId: trip.id, preselectedMonth: detectedMonth };

            for (const row of passengerData) {
                 if (!row[colMap['PASAJERO']] || !row[colMap['DNI']]) continue;

                const passengerName = row[colMap['PASAJERO']].trim();
                const passengerDNI = String(row[colMap['DNI']]).trim();

                let passenger = passengers.find(p => p.dni === passengerDNI);
                
                if (passenger) {
                    passengers = passengers.map(p => p.id === passenger!.id ? {...p, fullName: passengerName, phone: row[colMap['TEL']] ? String(row[colMap['TEL']]) : p.phone} : p)
                    resultCounts.updatedPassengers++;
                } else {
                    passenger = {
                        id: `P-${passengerDNI}`,
                        fullName: passengerName,
                        dni: passengerDNI,
                        dob: excelDateToJSDate(row[colMap['FECHA NAC.']]),
                        phone: row[colMap['TEL']] ? String(row[colMap['TEL']]) : undefined,
                        nationality: "Argentina",
                        tierId: "adult", // Default, could be refined with GRUPO ETARIO
                    };
                    passengers.push(passenger);
                    resultCounts.newPassengers++;
                }

                if(trip.price === 0 && row[colMap['VALOR']]) {
                    trip.price = parseFloat(row[colMap['VALOR']]);
                }
                
                const installments: Installment[] = [];
                const cuotas = [
                    { amount: row[colMap['CUOTA 1']], paid: true },
                    { amount: row[colMap['CUOTA 2']], paid: true },
                    { amount: row[colMap['CUOTA 3']], paid: true },
                    { amount: row[colMap['CUOTA 4']], paid: true },
                ];
                cuotas.forEach(c => {
                    if (c.amount && !isNaN(parseFloat(c.amount))) {
                        installments.push({ amount: parseFloat(c.amount), isPaid: c.paid });
                    }
                });

                const finalPrice = row[colMap['VALOR']] || 0;
                const paidAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);

                const sellerName = row[colMap['VENDEDOR']];
                const seller = sellers.find(s => s.name.toLowerCase() === sellerName?.toLowerCase());

                const reservation: Reservation = {
                    id: `R-${trip.id}-${passenger.id}`,
                    tripId: trip.id,
                    passenger: passengerName,
                    passengerIds: [passenger.id],
                    paxCount: row[colMap['CANTIDAD']] || 1,
                    status: 'Confirmado',
                    paymentStatus: finalPrice > 0 ? (paidAmount >= finalPrice ? "Pagado" : (paidAmount > 0 ? "Parcial" : "Pendiente")) : "Pendiente",
                    finalPrice: finalPrice,
                    installments: {
                        count: installments.length || 1,
                        details: installments.length > 0 ? installments : [{ amount: finalPrice, isPaid: false}],
                    },
                    assignedSeats: [],
                    assignedCabins: [],
                    sellerId: seller?.id || 'unassigned'
                };
                
                const existingResIndex = reservations.findIndex(r => r.id === reservation.id);
                if (existingResIndex > -1) {
                    reservations[existingResIndex] = reservation;
                } else {
                    reservations.push(reservation);
                    resultCounts.newReservations++;
                }
            }

            if (newTourCreated) {
                tours.push(trip);
                resultCounts.newTours = 1;
            } else {
                 const tourIndex = tours.findIndex(t => t.id === trip!.id);
                 if (tourIndex > -1) tours[tourIndex] = trip;
            }
            
            localStorage.setItem("ytl_tours", JSON.stringify(tours));
            localStorage.setItem("ytl_passengers", JSON.stringify(passengers));
            localStorage.setItem("ytl_reservations", JSON.stringify(reservations));
            
            if(!newTourCreated) {
                window.dispatchEvent(new Event('storage'));
            }

            toast({
                title: "¡Importación Exitosa!",
                description: "La plantilla de Excel ha sido procesada."
            });
            setImportResult(resultCounts);

        } catch (error) {
            console.error("Error al importar el archivo:", error);
            toast({ title: "Error de importación", description: "No se pudo leer el archivo. Asegúrate de que sea un Excel válido y que las columnas coincidan.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleSaveDate = () => {
        if (!importResult?.createdTripId || !newTripDate) {
            toast({ title: "Falta la fecha", description: "Por favor, selecciona una fecha para el viaje.", variant: "destructive"});
            return;
        }

        const tours: Tour[] = JSON.parse(localStorage.getItem("ytl_tours") || "[]");
        const updatedTours = tours.map(t => {
            if (t.id === importResult.createdTripId) {
                return { ...t, date: newTripDate };
            }
            return t;
        });

        localStorage.setItem("ytl_tours", JSON.stringify(updatedTours));
        window.dispatchEvent(new Event('storage'));
        toast({ title: "¡Viaje guardado!", description: "La fecha se ha asignado correctamente."});
        onOpenChange(false);
    }

    const renderContent = () => {
        if (importResult && importResult.newTours > 0) {
            return (
                <div className="space-y-4">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Paso 1: Importación Completada</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5">
                                <li>Viajes nuevos: {importResult.newTours}</li>
                                <li>Reservas creadas: {importResult.newReservations}</li>
                                <li>Pasajeros nuevos: {importResult.newPassengers}</li>
                                <li>Pasajeros actualizados: {importResult.updatedPassengers}</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                     <Alert variant="destructive">
                        <CalendarIcon className="h-4 w-4" />
                        <AlertTitle>Paso 2: Asigna la Fecha del Viaje</AlertTitle>
                        <AlertDescription>
                            <div className="space-y-2 mt-2">
                                <Label htmlFor="new-trip-date">Fecha de Salida</Label>
                                <DatePicker 
                                    id="new-trip-date"
                                    date={newTripDate}
                                    setDate={setNewTripDate}
                                    defaultMonth={importResult.preselectedMonth !== undefined ? new Date(new Date().getFullYear(), importResult.preselectedMonth) : undefined}
                                />
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )
        }

        if (importResult) {
            return (
                 <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Importación Completada</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            <li>Viajes actualizados: 1</li>
                            <li>Reservas creadas/actualizadas: {importResult.newReservations}</li>
                            <li>Pasajeros nuevos: {importResult.newPassengers}</li>
                            <li>Pasajeros actualizados: {importResult.updatedPassengers}</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            )
        }

        return (
             <div className="space-y-2">
                <Label htmlFor="template-file">Archivo Excel</Label>
                <Input id="template-file" type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Importar desde Plantilla Excel</DialogTitle>
                    <DialogDescription>
                        Selecciona el archivo Excel (.xlsx, .xls) para importar los datos de un viaje. El sistema creará el viaje si no existe y añadirá los pasajeros y reservas.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {renderContent()}
                </div>
                <DialogFooter>
                     {importResult && importResult.newTours > 0 ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                            <Button onClick={handleSaveDate} disabled={!newTripDate}>
                                <Save className="mr-2 h-4 w-4"/>
                                Guardar Fecha y Finalizar
                            </Button>
                        </>
                    ) : importResult ? (
                        <Button onClick={() => onOpenChange(false)}>Finalizar</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                            <Button onClick={handleImport} disabled={!file || isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {isLoading ? "Procesando..." : "Importar"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
