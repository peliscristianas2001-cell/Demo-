
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
import type { Tour, Passenger, Reservation, Seller, PricingTier, Installment, BoardingPoint } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { CheckCircle, Loader2, UploadCloud, Calendar as CalendarIcon, Save } from "lucide-react"
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

const excelDateToJSDate = (serial: number): Date | undefined => {
   if (typeof serial !== 'number' || isNaN(serial)) return undefined;
   // Excel's epoch starts on 1900-01-01, but it incorrectly thinks 1900 was a leap year.
   // This formula correctly handles dates after 1900-02-28.
   if (serial < 61) { // Before 1900-03-01
      serial--;
   }
   const utc_days  = Math.floor(serial - 25569);
   const utc_value = utc_days * 86400;                                        
   const date_info = new Date(utc_value * 1000);
   // Adjust for timezone offset
   return new Date(date_info.getTime() + (date_info.getTimezoneOffset() * 60000));
}

const normalizeHeader = (header: string) => (header || '').trim().toUpperCase().replace(/\./g, '');

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w+/g, char => char.charAt(0).toUpperCase() + char.substring(1));
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
            const workbook = XLSX.read(data, { cellStyles: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const headerRow: string[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "B6:AH6" })[0] || [];
            const colMap: Record<string, string> = headerRow.reduce((acc, curr, i) => {
                if (curr) acc[normalizeHeader(curr)] = XLSX.utils.encode_col(i + 1); // +1 because we start from column B
                return acc;
            }, {} as Record<string, string>);

            const passengerData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: "A", range: `B7:AH67` });
            const pricingData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "AZ179:BA184" });
            
            let allTours: Tour[] = JSON.parse(localStorage.getItem("ytl_tours") || JSON.stringify(mockTours));
            let allPassengers: Passenger[] = JSON.parse(localStorage.getItem("ytl_passengers") || JSON.stringify(mockPassengers));
            let allReservations: Reservation[] = JSON.parse(localStorage.getItem("ytl_reservations") || JSON.stringify(mockReservations));
            const allSellers: Seller[] = JSON.parse(localStorage.getItem("ytl_sellers") || JSON.stringify(mockSellers));
            let allBoardingPoints: BoardingPoint[] = JSON.parse(localStorage.getItem("ytl_boarding_points") || JSON.stringify(mockBoardingPoints));
            
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const nameParts = fileName.split(' ');
            const monthWord = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
            const detectedMonth = monthMap[monthWord];
            const tripNameRaw = typeof detectedMonth !== 'undefined' ? nameParts.slice(0, -1).join(' ') : fileName;
            const tripName = toTitleCase(tripNameRaw);

            let trip = allTours.find(t => t.destination.toLowerCase() === tripName.toLowerCase());
            let newTourCreated = false;
            if (!trip) {
                const newPricingTiers: PricingTier[] = pricingData.map((row: any[], index: number) => ({
                    id: `T-imported-${index}`,
                    name: row[0] || 'Desconocido',
                    price: parseFloat(row[1]) || 0
                })).filter(tier => tier.name !== 'Desconocido' && tier.price > 0 && normalizeHeader(tier.name) !== 'TOTAL');
                
                const basePrice = newPricingTiers.find(t => normalizeHeader(t.name) === 'ADULTO')?.price || 0;

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
            const updatedPassengersMap = new Map<string, Passenger>();
            const newReservationsList: Reservation[] = [];
            const colorToFamilyName = new Map<string, string>();

            for (const [rowIndex, row] of passengerData.entries()) {
                const passengerNameRaw = row[colMap['PASAJERO']];
                if (!passengerNameRaw) continue; // Skip empty rows

                const passengerName = toTitleCase(passengerNameRaw.trim());
                const passengerDNI = String(row[colMap['DNI']] || '').replace(/\D/g, '');

                if (!passengerName || !passengerDNI) continue;
                
                // Family by color logic
                let familyName = "";
                const cellRef = `${colMap['PASAJERO']}${rowIndex + 7}`;
                const cell = worksheet[cellRef];
                const cellColor = cell?.s?.fgColor?.rgb;
                
                if (cellColor && cellColor !== 'FFFFFFFF' && cellColor !== '00000000') { // Ignore white/transparent
                    if (colorToFamilyName.has(cellColor)) {
                        familyName = colorToFamilyName.get(cellColor)!;
                    } else {
                        familyName = `Familia ${passengerName.split(' ')[1] || passengerName}`;
                        colorToFamilyName.set(cellColor, familyName);
                    }
                }

                let passenger = allPassengers.find(p => p.dni === passengerDNI) || updatedPassengersMap.get(passengerDNI);
                
                // Boarding Point Logic
                const boardingPointRaw = row[colMap['EMBARQUE']] ? String(row[colMap['EMBARQUE']]) : undefined;
                let boardingPointId: string | undefined;

                if (boardingPointRaw && /^[A-Z]-/.test(boardingPointRaw)) {
                    const bpId = boardingPointRaw.charAt(0);
                    const bpName = toTitleCase(boardingPointRaw.substring(2).trim());
                    boardingPointId = bpId;
                    
                    const existingBp = allBoardingPoints.find(bp => bp.id === bpId);
                    if (!existingBp) {
                        allBoardingPoints.push({ id: bpId, name: bpName });
                    } else if (existingBp.name !== bpName) {
                        existingBp.name = bpName; // Update name if it changed
                    }
                }
                
                const passengerUpdate: Partial<Passenger> & { fullName: string } = {
                    fullName: passengerName,
                    dob: excelDateToJSDate(row[colMap['FECHA NAC']]),
                    phone: row[colMap['TEL']] ? String(row[colMap['TEL']]) : undefined,
                    family: familyName || passenger?.family || "", // Prioritize new color family, then existing, then default
                    boardingPointId: boardingPointId
                };

                if (passenger) {
                    passenger = { ...passenger, ...passengerUpdate };
                    resultCounts.updatedPassengers++;
                } else {
                    passenger = {
                        id: `P-${passengerDNI}`,
                        dni: passengerDNI,
                        nationality: "Argentina",
                        tierId: "adult",
                        ...passengerUpdate,
                    } as Passenger;
                    resultCounts.newPassengers++;
                }
                updatedPassengersMap.set(passenger.dni, passenger);
                
                if(trip && trip.price === 0 && row[colMap['VALOR']]) {
                    trip.price = parseFloat(row[colMap['VALOR']]);
                }
                
                const installments: Installment[] = [];
                const cuotas = [
                    { amount: row[colMap['CUOTA 1']] },
                    { amount: row[colMap['CUOTA 2']] },
                    { amount: row[colMap['CUOTA 3']] },
                    { amount: row[colMap['CUOTA 4']] },
                ];
                cuotas.forEach(c => {
                    if (c.amount && !isNaN(parseFloat(c.amount))) {
                        installments.push({ amount: parseFloat(c.amount), isPaid: true });
                    }
                });

                const finalPrice = row[colMap['VALOR']] || 0;
                const paidAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);

                const sellerName = row[colMap['VENDEDOR']];
                const seller = allSellers.find(s => s.name.toLowerCase() === sellerName?.toLowerCase());

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
                        details: installments.length > 0 ? installments : [{ amount: finalPrice, isPaid: false }],
                    },
                    assignedSeats: [],
                    assignedCabins: [],
                    sellerId: seller?.id || 'unassigned',
                    boardingPointId: boardingPointId
                };
                newReservationsList.push(reservation);
            }
            resultCounts.newReservations = newReservationsList.length;

            // Merge updated passengers back into the main list
            updatedPassengersMap.forEach(p => {
                const index = allPassengers.findIndex(ap => ap.id === p.id);
                if (index > -1) {
                    allPassengers[index] = p;
                } else {
                    allPassengers.push(p);
                }
            });

            // Merge new/updated reservations
            newReservationsList.forEach(nr => {
                const index = allReservations.findIndex(ar => ar.id === nr.id);
                if (index > -1) {
                    allReservations[index] = nr;
                } else {
                    allReservations.push(nr);
                }
            });

            if (newTourCreated && trip) {
                allTours.push(trip);
                resultCounts.newTours = 1;
            } else if (trip) {
                 const tourIndex = allTours.findIndex(t => t.id === trip!.id);
                 if (tourIndex > -1) allTours[tourIndex] = trip;
            }
            
            localStorage.setItem("ytl_tours", JSON.stringify(allTours));
            localStorage.setItem("ytl_passengers", JSON.stringify(allPassengers));
            localStorage.setItem("ytl_reservations", JSON.stringify(allReservations));
            localStorage.setItem("ytl_boarding_points", JSON.stringify(allBoardingPoints));
            
            window.dispatchEvent(new Event('storage'));

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
