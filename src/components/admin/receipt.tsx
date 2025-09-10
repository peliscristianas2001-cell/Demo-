
"use client"

import React, { useEffect, useState } from "react";
import type { Reservation, Passenger, Tour } from "@/lib/types";
import { Logo } from "../logo";
import { mockPassengers, mockTours } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
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

// A simple editable field component to avoid repetition
const EditableField = ({ value, onChange, className }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, className?: string }) => (
    <Input 
        value={value} 
        onChange={onChange} 
        className={`font-serif bg-transparent border-0 border-b border-dotted rounded-none px-1 h-7 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-solid focus:border-b-black ${className}`}
    />
);

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
            paidAmountText: `$ ${paidAmount.toLocaleString('es-AR')}`,
            concept: `Viaje a ${tour?.destination || ''} para ${reservation.paxCount} pasajero(s).`,
            destination: tour?.destination || '',
            paxCount: reservation.paxCount,
            tourDate: tour ? new Date(tour.date).toLocaleDateString('es-AR') : '',
            totalAmountText: `$ ${reservation.finalPrice.toLocaleString('es-AR')}`,
            cancellationPolicy: tour?.cancellationPolicy || globalCancellationPolicy,
        };

        setReceiptData(initialData);

    }, [reservation]);

    const handleDataChange = (field: keyof ReceiptData, value: string | number) => {
        if (!receiptData) return;
        setReceiptData(prev => ({...prev!, [field]: value}));
    }
     
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!receiptData) return;
        setReceiptData(prev => ({...prev!, cancellationPolicy: e.target.value}));
    }

    if (!receiptData) {
        return <div className="bg-white w-[210mm] min-h-[297mm] flex items-center justify-center">Cargando recibo...</div>
    }

    return (
        <div className="bg-white w-[210mm] h-[297mm] text-black font-serif text-xs p-12 shadow-lg flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-start pb-4 border-b border-black">
                <div className="w-24 h-24 flex-shrink-0">
                    <Logo/>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold tracking-tight">RECIBO</h1>
                    <p className="font-mono text-base tracking-wider">N° {receiptData.receiptNumber}</p>
                </div>
            </header>

            {/* Info Section */}
            <section className="mt-6">
                <div className="flex justify-between">
                    <div className="w-3/5 space-y-4">
                        <div className="flex items-center gap-2">
                            <span>Recibí de:</span>
                            <EditableField value={receiptData.passengerName} onChange={e => handleDataChange('passengerName', e.target.value)} className="flex-grow" />
                        </div>
                        <div className="flex items-center gap-2">
                           <span>La suma de:</span>
                           <EditableField value={receiptData.paidAmountText} onChange={e => handleDataChange('paidAmountText', e.target.value)} className="flex-grow" />
                        </div>
                    </div>
                    <div className="w-1/3">
                        <div className="border border-black p-2 text-center">
                            <span className="block text-xs">Fecha</span>
                            <EditableField value={receiptData.date} onChange={e => handleDataChange('date', e.target.value)} className="text-lg font-bold text-center !h-8" />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Concept Section */}
            <section className="mt-4">
                 <div className="flex items-center gap-2">
                    <span>En concepto de:</span>
                    <EditableField value={receiptData.concept} onChange={e => handleDataChange('concept', e.target.value)} className="flex-grow" />
                </div>
            </section>

             <section className="mt-8 flex justify-end">
                <div className="w-1/3 flex items-baseline gap-2">
                    <span className="font-bold">TOTAL:</span>
                    <EditableField value={receiptData.totalAmountText} onChange={e => handleDataChange('totalAmountText', e.target.value)} className="text-base font-bold flex-grow text-right"/>
                </div>
             </section>
             
            {/* Terms and Conditions */}
             <section className="mt-8 text-[8px] leading-tight flex-grow">
                <h4 className="font-bold text-[9px] mb-1 uppercase underline">Política de Cancelación</h4>
                <div className="whitespace-pre-line">
                   {receiptData.cancellationPolicy}
                </div>
             </section>

            {/* Footer and Signatures */}
            <footer className="pt-8 flex justify-around">
                 <div className="border-t border-black pt-2 text-center w-64">
                    <p>Firma del Pasajero</p>
                </div>
                 <div className="border-t border-black pt-2 text-center w-64">
                    <p>Firma y Aclaración</p>
                </div>
            </footer>
        </div>
    );
}
