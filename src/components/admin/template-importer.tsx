
"use client"

import { useState, useMemo, useEffect } from "react"
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
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ').trim();
}

const generateNextReservationId = () => {
    const counters = JSON.parse(localStorage.getItem('ytl_reservation_counters') || '{}');
    const year = new Date().getFullYear().toString().slice(-2);
    const currentCount = counters[year] || 0;
    const nextCount = currentCount + 1;
    counters[year] = nextCount;
    localStorage.setItem('ytl_reservation_counters', JSON.stringify(counters));
    return `R-${year}-${String(nextCount).padStart(3, '0')}`;
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
            let allBoardingPoints: BoardingPoint[] = JSON.parse(localStorage.getItem("ytl_boarding_points") || JSON.stringify(mockBoardingPoints));
            const allSellers: Seller[] = JSON.parse(localStorage.getItem("ytl_sellers") || JSON.stringify(mockSellers));
            
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
                    flyers: [],
                    date: new Date(), 
                    pricingTiers: newPricingTiers
                };
                newTourCreated = true;
            }

            let resultCounts = { newTours: 0, newReservations: 0, newPassengers: 0, updatedPassengers: 0, createdTripId: trip.id, preselectedMonth: detectedMonth };
            const updatedPassengersMap = new Map<string, Passenger>();
            let reservationMap = new Map<string, Reservation>();
            const familyGroups = new Map<string, any[]>(); // color -> excel rows
            
            // First Pass: Group all rows by cell color
            for (const [rowIndex, row] of passengerData.entries()) {
                const passengerNameRaw = row[colMap['PASAJERO']];
                if (!passengerNameRaw || !String(passengerNameRaw).trim()) continue;

                const cellRef = `${colMap['PASAJERO']}${rowIndex + 7}`;
                const cell = worksheet[cellRef];
                let familyColor = cell?.s?.fgColor?.rgb || 'no-color';
                
                if (familyColor === 'FFFFFFFF' || familyColor === '00000000' || !cell?.s?.fgColor) {
                    familyColor = `no-color-${rowIndex}`; 
                }

                if (!familyGroups.has(familyColor)) familyGroups.set(familyColor, []);
                familyGroups.get(familyColor)!.push(row);
            }

            const familyNamesCount = new Map<string, number>();

            // Second pass: Process each color group to form families and reservations
            familyGroups.forEach((groupRows) => {
                const membersInGroup: Passenger[] = [];
                const familyPayers = groupRows.filter(r => r[colMap['CANTIDAD']] || r[colMap['VALOR']]);
                const mainPayerRow = familyPayers[0] || groupRows[0];
                const mainPayerName = toTitleCase(mainPayerRow[colMap['PASAJERO']]);
                const nameParts = mainPayerName.split(' ');
                const lastName = nameParts[nameParts.length - 1];
                let familyName = lastName;

                const count = familyNamesCount.get(lastName) || 0;
                if (count > 0) familyName = `${lastName} (${count + 1})`;
                familyNamesCount.set(lastName, (count + 1));
                
                // Create/Update all passenger objects for this color group first, assigning the determined family name
                groupRows.forEach(row => {
                    const passengerName = toTitleCase(row[colMap['PASAJERO']]);
                    const passengerDNI = String(row[colMap['DNI']] || '').replace(/\D/g, '');
                    if (!passengerName || !passengerDNI) return;

                    let passenger = allPassengers.find(p => p.dni === passengerDNI) || updatedPassengersMap.get(passengerDNI);
                    
                    const boardingPointRaw = row[colMap['EMBARQUE']] ? String(row[colMap['EMBARQUE']]) : undefined;
                    let boardingPointId: string | undefined;

                    if (boardingPointRaw && /^[A-Z]-/.test(boardingPointRaw)) {
                        const bpId = boardingPointRaw.charAt(0);
                        
                        if (!allBoardingPoints.some(bp => bp.id === bpId)) {
                           const bpName = toTitleCase(boardingPointRaw.substring(2).trim());
                           allBoardingPoints.push({ id: bpId, name: bpName });
                        }
                        boardingPointId = bpId;
                    }
                    
                    const passengerUpdate: Partial<Passenger> & { fullName: string; family: string; } = {
                        fullName: passengerName,
                        family: familyName,
                        dob: excelDateToJSDate(row[colMap['FECHA NAC']]),
                        phone: row[colMap['TEL']] ? String(row[colMap['TEL']]) : undefined,
                        boardingPointId: boardingPointId
                    };
    
                    if (passenger) {
                        passenger = { ...passenger, ...passengerUpdate };
                        if(!updatedPassengersMap.has(passenger.dni)) resultCounts.updatedPassengers++;
                    } else {
                        passenger = { id: `P-${passengerDNI}`, dni: passengerDNI, nationality: "Argentina", tierId: "adult", ...passengerUpdate } as Passenger;
                        resultCounts.newPassengers++;
                    }
                    updatedPassengersMap.set(passenger.dni, passenger);
                    membersInGroup.push(passenger);
                });

                const payers = membersInGroup.filter(m => {
                    const row = groupRows.find(r => String(r[colMap['DNI']] || '').replace(/\D/g, '') === m.dni);
                    return row && (row[colMap['CANTIDAD']] || row[colMap['VALOR']]);
                });
                
                let nonPayers = membersInGroup.filter(m => !payers.some(p => p.id === m.id));

                payers.forEach(payer => {
                    const reservationMembers = [payer];
                    const payerRow = groupRows.find(r => String(r[colMap['DNI']] || '').replace(/\D/g, '') === payer.dni);
                    if (!payerRow) return;

                    const paxCount = payerRow[colMap['CANTIDAD']] || 1;
                    
                    // Temporary array of non-payers to assign from
                    const availableNonPayers = [...nonPayers];
                    for (let i = availableNonPayers.length - 1; i >= 0; i--) {
                        const nonPayer = availableNonPayers[i];
                        if (reservationMembers.length < paxCount && nonPayer.boardingPointId === payer.boardingPointId) {
                            reservationMembers.push(nonPayer);
                            // Remove assigned non-payer from the main non-payer pool for this family
                            nonPayers = nonPayers.filter(np => np.id !== nonPayer.id);
                        }
                    }
                    
                    const installments: Installment[] = ['CUOTA 1', 'CUOTA 2', 'CUOTA 3', 'CUOTA 4'].map(c => payerRow[colMap[c]])
                        .filter(amount => amount && !isNaN(parseFloat(amount)))
                        .map(amount => ({ amount: parseFloat(amount), isPaid: true }));

                    const finalPrice = payerRow[colMap['VALOR']] || 0;
                    const paidAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
                    const seller = allSellers.find(s => s.name.toLowerCase() === (payerRow[colMap['VENDEDOR']] || '').toLowerCase());

                    const reservation: Reservation = {
                        id: generateNextReservationId(),
                        tripId: trip!.id,
                        passenger: payer.fullName,
                        passengerIds: reservationMembers.map(m => m.id),
                        paxCount: paxCount,
                        status: 'Confirmado',
                        paymentStatus: finalPrice > 0 ? (paidAmount >= finalPrice ? "Pagado" : (paidAmount > 0 ? "Parcial" : "Pendiente")) : "Pendiente",
                        finalPrice: finalPrice,
                        installments: { count: installments.length || 1, details: installments.length > 0 ? installments : [{ amount: finalPrice, isPaid: false }] },
                        assignedSeats: [], assignedCabins: [],
                        sellerId: seller?.id || 'unassigned',
                        boardingPointId: payer.boardingPointId,
                    };
                    
                    reservationMap.set(payer.dni, reservation);
                });
            });
            
            const newReservationsList = Array.from(reservationMap.values());
            resultCounts.newReservations = newReservationsList.length;

            updatedPassengersMap.forEach(p => {
                const index = allPassengers.findIndex(ap => ap.id === p.id);
                if (index > -1) allPassengers[index] = p; else allPassengers.push(p);
            });

            newReservationsList.forEach(nr => {
                const index = allReservations.findIndex(ar => ar.id === nr.id);
                if (index > -1) allReservations[index] = nr; else allReservations.push(nr);
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

            toast({ title: "¡Importación Exitosa!", description: "La plantilla de Excel ha sido procesada." });
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
