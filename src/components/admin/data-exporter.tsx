
"use client"

import { useState, useMemo, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockTours, mockReservations, mockPassengers } from "@/lib/mock-data";
import type { Tour, Reservation, Passenger } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Download, Copy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataExporterProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const dataColumns = {
  fullName: "Nombre",
  dni: "DNI",
  age: "Edad",
  dob: "F. Nacimiento",
  boardingPoint: "Embarque",
};

const calculateAge = (dob?: Date | string) => {
  if (!dob) return "";
  const birthDate = typeof dob === "string" ? new Date(dob) : dob;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return String(age);
};

export function DataExporter({ isOpen, onOpenChange }: DataExporterProps) {
  const { toast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [boardingPoints, setBoardingPoints] = useState<any[]>([]);

  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["fullName", "dni"]);
  const [showInsuredOnly, setShowInsuredOnly] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load data from localStorage every time the dialog opens
      setTours(JSON.parse(localStorage.getItem("ytl_tours") || JSON.stringify(mockTours)));
      setReservations(JSON.parse(localStorage.getItem("ytl_reservations") || JSON.stringify(mockReservations)));
      setPassengers(JSON.parse(localStorage.getItem("ytl_passengers") || JSON.stringify(mockPassengers)));
      setBoardingPoints(JSON.parse(localStorage.getItem("ytl_boarding_points") || "[]"));
    }
  }, [isOpen]);

  const exportableData = useMemo(() => {
    const tripsToExport = tours.filter((t) => selectedTripIds.includes(t.id));
    
    return tripsToExport.map((trip) => {
      let tripPassengers = reservations
        .filter((r) => r.tripId === trip.id)
        .flatMap((r) => {
            const reservationPassengers = passengers.filter(p => r.passengerIds.includes(p.id));
            if (showInsuredOnly) {
                return reservationPassengers.filter(p => (r.insuredPassengerIds || []).includes(p.id));
            }
            return reservationPassengers;
        });

      // Remove duplicates
      tripPassengers = tripPassengers.filter((p, index, self) => index === self.findIndex((t) => t.id === p.id));

      const passengerData = tripPassengers.map(p => {
          const boardingPoint = boardingPoints.find(bp => bp.id === p.boardingPointId)?.name || "N/A";
          const dobString = p.dob ? new Date(p.dob).toLocaleDateString("es-AR") : "N/A";
          return {
              id: p.id,
              fullName: p.fullName,
              dni: p.dni,
              age: calculateAge(p.dob),
              dob: dobString,
              boardingPoint,
          };
      });

      return { trip, passengers: passengerData };
    });
  }, [selectedTripIds, passengers, reservations, tours, showInsuredOnly, boardingPoints]);

  const handleCopy = (tripId: string) => {
    const tripData = exportableData.find(d => d.trip.id === tripId);
    if (!tripData) return;

    const headers = selectedColumns.map(col => dataColumns[col as keyof typeof dataColumns]).join('\t');
    const rows = tripData.passengers.map(p => {
        return selectedColumns.map(col => (p as any)[col]).join('\t');
    }).join('\n');

    navigator.clipboard.writeText(`${headers}\n${rows}`);
    toast({ title: "Copiado!", description: `Datos de ${tripData.trip.destination} copiados al portapapeles.` });
  };

  const handleExportPdf = (tripId: string) => {
    const tripData = exportableData.find(d => d.trip.id === tripId);
    if (!tripData) return;

    const doc = new jsPDF();
    const tableHeaders = selectedColumns.map(col => dataColumns[col as keyof typeof dataColumns]);
    const tableBody = tripData.passengers.map(p => selectedColumns.map(col => (p as any)[col]));
    
    (doc as any).autoTable({
        head: [tableHeaders],
        body: tableBody,
        startY: 20,
    });
    doc.text(`Pasajeros para ${tripData.trip.destination}`, 14, 15);
    doc.save(`Pasajeros_${tripData.trip.destination.replace(/ /g, "_")}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Datos de Exportación</DialogTitle>
          <DialogDescription>
            Selecciona los viajes y los datos que quieres ver, copiar o exportar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4 flex-1 overflow-hidden">
          {/* Columna de Filtros */}
          <div className="col-span-1 border-r pr-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">Viajes</Label>
              <ScrollArea className="h-48 border rounded-md p-2">
                {tours.map((tour) => (
                  <div key={tour.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trip-${tour.id}`}
                      checked={selectedTripIds.includes(tour.id)}
                      onCheckedChange={(checked) => {
                        setSelectedTripIds((prev) =>
                          checked ? [...prev, tour.id] : prev.filter((id) => id !== tour.id)
                        );
                      }}
                    />
                    <Label htmlFor={`trip-${tour.id}`} className="font-normal">{tour.destination}</Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Columnas</Label>
              <div className="space-y-2">
                {Object.entries(dataColumns).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-${key}`}
                      checked={selectedColumns.includes(key)}
                      onCheckedChange={(checked) => {
                        setSelectedColumns((prev) =>
                          checked ? [...prev, key] : prev.filter((col) => col !== key)
                        );
                      }}
                    />
                    <Label htmlFor={`col-${key}`} className="font-normal">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
             <div className="flex items-center space-x-2">
                <Checkbox
                    id="insured-only"
                    checked={showInsuredOnly}
                    onCheckedChange={(checked) => setShowInsuredOnly(!!checked)}
                />
                <Label htmlFor="insured-only">Mostrar solo pasajeros con seguro</Label>
            </div>
          </div>

          {/* Columna de Resultados */}
          <div className="col-span-3 overflow-hidden flex flex-col">
            <Label className="font-semibold mb-2">Resultados</Label>
            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-2">
                {exportableData.length > 0 ? (
                  exportableData.map(({ trip, passengers: tripPassengers }) => (
                    <div key={trip.id} className="border rounded-lg">
                      <div className="bg-muted p-3 flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                            {trip.destination} 
                            <Badge variant="secondary" className="flex items-center gap-1.5"><Users className="h-3 w-3"/>{tripPassengers.length}</Badge>
                        </h3>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleCopy(trip.id)}><Copy className="mr-2 h-4 w-4" /> Copiar</Button>
                          <Button size="sm" variant="outline" onClick={() => handleExportPdf(trip.id)}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                              {selectedColumns.map((col) => <TableHead key={col}>{dataColumns[col as keyof typeof dataColumns]}</TableHead>)}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tripPassengers.map((p) => (
                              <TableRow key={p.id}>
                                {selectedColumns.map(col => <TableCell key={col}>{(p as any)[col]}</TableCell>)}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground p-8">
                    Selecciona al menos un viaje para ver los datos.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
