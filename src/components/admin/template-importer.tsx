
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
import type { Tour, Passenger, Reservation, Seller, BoardingPoint, Installment } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { CheckCircle, InfoIcon, Loader2, UploadCloud } from "lucide-react"

interface TemplateImporterProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const monthMap: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
};

export function TemplateImporter({ isOpen, onOpenChange }: TemplateImporterProps) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState<{ newTours: number, newReservations: number, newPassengers: number, updatedPassengers: number } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setImportResult(null);
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
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "A4:AI68" });

            const tours: Tour[] = JSON.parse(localStorage.getItem("ytl_tours") || JSON.stringify(mockTours));
            const passengers: Passenger[] = JSON.parse(localStorage.getItem("ytl_passengers") || JSON.stringify(mockPassengers));
            const reservations: Reservation[] = JSON.parse(localStorage.getItem("ytl_reservations") || JSON.stringify(mockReservations));
            const sellers: Seller[] = JSON.parse(localStorage.getItem("ytl_sellers") || JSON.stringify(mockSellers));
            const boardingPoints: BoardingPoint[] = JSON.parse(localStorage.getItem("ytl_boarding_points") || JSON.stringify(mockBoardingPoints));

            // -- Trip processing --
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const nameParts = fileName.split(' ');
            const monthWord = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
            const detectedMonth = monthMap[monthWord];
            const tripName = typeof detectedMonth !== 'undefined' ? nameParts.slice(0, -1).join(' ') : fileName;

            let trip = tours.find(t => t.destination.toLowerCase() === tripName.toLowerCase());
            let newTourCreated = false;
            if (!trip) {
                trip = {
                    id: `T-${Date.now()}`,
                    destination: tripName,
                    price: 0, // Will be updated by first passenger with price
                    flyerUrl: 'https://placehold.co/400x500.png',
                    flyerType: 'image',
                    date: new Date(), // Placeholder date
                    // @ts-ignore
                    requiresDateUpdate: true, // Custom flag
                    preselectedMonth: detectedMonth,
                };
                tours.push(trip);
                newTourCreated = true;
            }

            let resultCounts = { newTours: newTourCreated ? 1 : 0, newReservations: 0, newPassengers: 0, updatedPassengers: 0 };

            // -- Passenger and Reservation processing --
            const headerRow = ["EMBARQUE","UBICACIÓN","SEGURO","PENSION","ROOMING","PASAJERO","DNI","FECHA","NAC.","EDAD","TEL","CANTIDAD","GRUPO ETARIO","VALOR","CUOTA 1","M","FECHA","CUOTA 2","M","FECHA","CUOTA 3","M","FECHA","CUOTA 4","M","FECHA","DEBE","VENDEDOR","COMISION"];
            const colMap: Record<string, number> = {
                embarque: 0, ubicacion: 1, seguro: 2, pension: 3, rooming: 4, pasajero: 5,
                dni: 6, fechaNac: 7, edad: 9, tel: 10, cantidad: 11, grupoEtario: 12,
                valor: 13, cuota1: 14, cuota2: 17, cuota3: 20, cuota4: 23, debe: 26, vendedor: 27
            };

            for (const row of json) {
                if (!row[colMap.pasajero] || !row[colMap.dni]) continue;

                const passengerName = row[colMap.pasajero].trim();
                const passengerDNI = String(row[colMap.dni]).trim();

                let passenger = passengers.find(p => p.dni === passengerDNI);
                
                if (passenger) {
                    resultCounts.updatedPassengers++;
                } else {
                    passenger = {
                        id: `P-${Date.now()}-${Math.random()}`,
                        fullName: passengerName,
                        dni: passengerDNI,
                        phone: row[colMap.tel] ? String(row[colMap.tel]) : undefined,
                        nationality: "Argentina",
                        tierId: "adult",
                    };
                    passengers.push(passenger);
                    resultCounts.newPassengers++;
                }

                if(trip.price === 0 && row[colMap.valor]) {
                    trip.price = parseFloat(row[colMap.valor]);
                }

                const installments: Installment[] = [];
                if(row[colMap.cuota1]) installments.push({ amount: row[colMap.cuota1], isPaid: true });
                if(row[colMap.cuota2]) installments.push({ amount: row[colMap.cuota2], isPaid: true });
                if(row[colMap.cuota3]) installments.push({ amount: row[colMap.cuota3], isPaid: true });
                if(row[colMap.cuota4]) installments.push({ amount: row[colMap.cuota4], isPaid: true });
                
                const finalPrice = row[colMap.valor] || 0;
                const paidAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);

                const reservation: Reservation = {
                    id: `R-${trip.id}-${passenger.id}`,
                    tripId: trip.id,
                    passenger: passengerName,
                    passengerIds: [passenger.id],
                    paxCount: row[colMap.cantidad] || 1,
                    status: 'Confirmado',
                    paymentStatus: finalPrice > 0 ? (paidAmount >= finalPrice ? "Pagado" : (paidAmount > 0 ? "Parcial" : "Pendiente")) : "Pendiente",
                    finalPrice: finalPrice,
                    installments: {
                        count: installments.length,
                        details: installments,
                    },
                    assignedSeats: [],
                    assignedCabins: [],
                    sellerId: 'unassigned' // TODO: Map seller from sheet
                };
                reservations.push(reservation);
                resultCounts.newReservations++;
            }
            
            localStorage.setItem("ytl_tours", JSON.stringify(tours));
            localStorage.setItem("ytl_passengers", JSON.stringify(passengers));
            localStorage.setItem("ytl_reservations", JSON.stringify(reservations));
            window.dispatchEvent(new Event('storage'));

            toast({
                title: "¡Importación Exitosa!",
                description: "La plantilla de Excel ha sido procesada."
            });
            setImportResult(resultCounts);
        } catch (error) {
            console.error("Error al importar el archivo:", error);
            toast({ title: "Error de importación", description: "No se pudo leer el archivo. Asegúrate de que sea un Excel válido.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Importar desde Plantilla Excel</DialogTitle>
                    <DialogDescription>
                        Selecciona el archivo de Excel (.xlsx, .xls) para importar los datos de un viaje. El sistema creará el viaje si no existe y añadirá los pasajeros y reservas.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="template-file">Archivo Excel</Label>
                        <Input id="template-file" type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
                    </div>

                    {importResult && (
                         <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Importación Completada</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-5">
                                    <li>Viajes nuevos: {importResult.newTours}</li>
                                    <li>Reservas creadas: {importResult.newReservations}</li>
                                    <li>Pasajeros nuevos: {importResult.newPassengers}</li>
                                    <li>Pasajeros actualizados: {importResult.updatedPassengers}</li>
                                </ul>
                                {importResult.newTours > 0 && (
                                    <p className="mt-2 font-semibold">
                                        <InfoIcon className="inline-block w-4 h-4 mr-1" />
                                        Acción requerida: Ve a la sección de "Viajes" para asignarle una fecha al nuevo viaje creado.
                                    </p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                    <Button onClick={handleImport} disabled={!file || isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        {isLoading ? "Procesando..." : "Importar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
