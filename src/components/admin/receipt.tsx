
"use client"

import React, { useEffect, useState } from "react";
import type { Reservation, Passenger, Tour } from "@/lib/types";
import { Logo } from "../logo";
import { mockPassengers, mockTours } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface ReceiptProps {
  reservation: Reservation;
}

interface ReceiptData {
    receiptNumber: string;
    date: string;
    passengerName: string;
    passengerPhone: string;
    paidAmountText: string;
    concept: string;
    destination: string;
    paxCount: number;
    tourDate: string;
    totalAmountText: string;
    cancellationPolicy: string;
}

export function Receipt({ reservation }: ReceiptProps) {
    const [allPassengers, setAllPassengers] = useState<Passenger[]>([]);
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

    useEffect(() => {
        const passengers = JSON.parse(localStorage.getItem("ytl_passengers") || JSON.stringify(mockPassengers));
        const tours = JSON.parse(localStorage.getItem("ytl_tours") || JSON.stringify(mockTours));
        const globalCancellationPolicy = localStorage.getItem("ytl_global_cancellation_policy") || `El valor del viaje pactado al momento de la consulta se mantiene siempre y cuando se abone la seña correspondiente. A partir del pago de la misma se congela el precio y esta no sufrirá aumentos. El viaje debe estar cancelado 15 días antes de la salida. De lo contrario podría darse de baja sin previo aviso, el mismo no tiene derecho a reembolso o reclamo alguno. CANCELACIÓN: Si el viaje se cancela 30 días previos a la salida: se pierde la seña por cada pasajero dado de baja. Si el viaje se cancela 30-15 días antes de la salida se pierde el 100% del valor abonado. Si el viaje se cancela 15 días antes a la salidas se pierde la totalidad del dinero presentado. CAMBIOS DE FECHA: Se podrá hacer cambio de fecha con un mes de anticipación, el costo adicional es de $50.000 por pasajero. Excepto que por fuerza mayor la empresa deba cancelar o dar de baja a la salida pactada, en ese caso se reprograma un nuevo destino. LIMITACIONES AL DERECHO DE PERMANENCIA: La empresa se reserva el derecho de hacer que abandone el tour en cualquier punto del mismo todo pasajero cuya conducta, modo de obrar, estado de salud u otras razones graves a juicio de la empresa provoque peligro o cause molestias a los restantes viajeros o pueda malograr el éxito de la excursión o el normal desarrollo de la misma. ASISTENCIA AL VIAJERO: La empresa deja sentado que los viajes que vende u organiza no cuentan con asistencia medica en ruta o en destino, y que ha ofrecido al pasajero la contratación de un servicio de asistencia al viajero, habiendo además informado del costo del mismo acorde a sus necesidades, no responsabilizándose por la opción del pasajero de contratarlo o no. Es responsabilidad del pasajero asistir de su propio patrimonio todos los gastos que sean necesarios para su propia atención medica o de familiares a cargo, internación, traslados, alojamiento especial, o todo lo que sea solicitado por el medico tratante. CONOCIMIENTO Y ACEPTACIÓN DE CONDICIONES: Estas condiciones son entregadas por la empresa al pasajero declarando conocerlas y aceptarlas, quien recibe las presentes condiciones generales lo hace como titular de la reserva, en nombre y representación de todos pasajeros que componen la misma.`;
        setAllPassengers(passengers);
        setAllTours(tours);

        const passenger = passengers.find((p: Passenger) => p.id === reservation.passengerIds[0]);
        const tour = tours.find((t: Tour) => t.id === reservation.tripId);
        
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        
        const paidAmount = reservation.installments?.details
            .filter(inst => inst.isPaid)
            .reduce((sum, inst) => sum + inst.amount, 0) || 0;

        const initialData: ReceiptData = {
            receiptNumber: reservation.id.substring(0, 8).toUpperCase(),
            date: `${day}/${month}/${year}`,
            passengerName: passenger?.fullName || '',
            passengerPhone: passenger?.phone || '',
            paidAmountText: paidAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
            concept: 'Seña/Pago de viaje',
            destination: tour?.destination || '',
            paxCount: reservation.paxCount,
            tourDate: tour ? new Date(tour.date).toLocaleDateString('es-AR') : '',
            totalAmountText: reservation.finalPrice.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
            cancellationPolicy: tour?.cancellationPolicy || globalCancellationPolicy,
        };

        setReceiptData(initialData);

    }, [reservation]);

    const handleDataChange = (field: keyof ReceiptData, value: string | number) => {
        if (!receiptData) return;
        setReceiptData(prev => ({...prev!, [field]: value}));
    }

    if (!receiptData) {
        return <div className="bg-white w-[210mm] min-h-[297mm] flex items-center justify-center">Cargando recibo...</div>
    }

    return (
        <div className="bg-white w-[210mm] min-h-[297mm] text-black font-serif text-sm p-8 shadow-lg flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-start pb-4 border-b-2 border-gray-300">
                <div className="w-24 h-24 flex-shrink-0">
                    <Logo/>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-800">RECIBO</h1>
                    <p className="font-mono text-lg text-gray-600 tracking-wider">N° {receiptData.receiptNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">Documento no válido como factura</p>
                </div>
            </header>

            {/* Info Section */}
            <section className="mt-8 grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="passengerName" className="text-gray-600">Recibí de:</Label>
                        <Input type="text" id="passengerName" value={receiptData.passengerName} onChange={e => handleDataChange('passengerName', e.target.value)} className="font-medium text-base bg-transparent border-0 border-b border-dashed rounded-none px-1 h-8"/>
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="passengerPhone" className="text-gray-600">Teléfono:</Label>
                        <Input type="text" id="passengerPhone" value={receiptData.passengerPhone} onChange={e => handleDataChange('passengerPhone', e.target.value)} className="font-medium bg-transparent border-0 border-b border-dashed rounded-none px-1 h-8"/>
                    </div>
                </div>
                <div className="text-right space-y-2">
                     <Label className="text-gray-600 block">Fecha de Emisión</Label>
                     <Input value={receiptData.date} onChange={e => handleDataChange('date', e.target.value)} className="text-lg font-semibold text-center bg-transparent border-0 border-b border-dashed rounded-none h-10"/>
                </div>
            </section>
            
            {/* Details Section */}
            <section className="mt-8 flex-grow space-y-4 rounded-lg bg-gray-50 p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-center mb-4 text-gray-700">Detalles del Pago</h2>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                     <div className="space-y-1.5">
                        <Label htmlFor="paidAmountText">Importe Recibido</Label>
                        <Input id="paidAmountText" value={receiptData.paidAmountText} onChange={e => handleDataChange('paidAmountText', e.target.value)} className="text-lg font-bold bg-white h-9" />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="concept">En concepto de</Label>
                        <Input id="concept" value={receiptData.concept} onChange={e => handleDataChange('concept', e.target.value)} className="bg-white h-9" />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="destination">Destino del Viaje</Label>
                        <Input id="destination" value={receiptData.destination} onChange={e => handleDataChange('destination', e.target.value)} className="bg-white h-9"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="tourDate">Fecha del Viaje</Label>
                            <Input id="tourDate" value={receiptData.tourDate} onChange={e => handleDataChange('tourDate', e.target.value)} className="bg-white h-9"/>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="paxCount">N° Pasajeros</Label>
                            <Input id="paxCount" type="number" value={receiptData.paxCount} onChange={e => handleDataChange('paxCount', parseInt(e.target.value) || 1)} className="bg-white h-9"/>
                        </div>
                    </div>
                 </div>
                 <div className="flex justify-end pt-4">
                    <div className="space-y-1.5 w-1/2">
                        <Label htmlFor="totalAmountText" className="text-base">Monto Total del Viaje</Label>
                        <Input id="totalAmountText" value={receiptData.totalAmountText} onChange={e => handleDataChange('totalAmountText', e.target.value)} className="text-2xl font-bold text-right h-12 bg-transparent border-0 border-b-2 rounded-none px-2 focus-visible:ring-0 focus-visible:ring-offset-0"/>
                    </div>
                </div>
            </section>

            {/* Footer and Signatures */}
            <footer className="mt-auto pt-8 space-y-6">
                 <div className="pt-8 grid grid-cols-2 gap-16">
                    <div className="border-t-2 border-gray-400 pt-2 text-center">
                        <p className="font-semibold">Firma del Pasajero</p>
                    </div>
                     <div className="border-t-2 border-gray-400 pt-2 text-center">
                        <p className="font-semibold">Firma y Aclaración (Agencia)</p>
                    </div>
                 </div>

                 <Separator />

                 <div className="space-y-2">
                    <Label htmlFor="cancellationPolicy" className="text-xs font-bold text-gray-500">Términos y Condiciones</Label>
                    <Textarea 
                        id="cancellationPolicy"
                        value={receiptData.cancellationPolicy}
                        onChange={e => handleDataChange('cancellationPolicy', e.target.value)}
                        className="text-[10px] leading-snug text-gray-600 h-40 resize-none bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                 </div>
                 <p className="text-center font-bold text-gray-700">AGENCIA YO TE LLEVO</p>
            </footer>
        </div>
    );
}

    