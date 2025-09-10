
"use client"

import React, { useEffect, useState } from "react";
import type { Reservation, Passenger, Tour } from "@/lib/types";
import { Logo } from "../logo";
import { mockPassengers, mockTours } from "@/lib/mock-data";

interface ReceiptProps {
  reservation: Reservation;
}

export function Receipt({ reservation }: ReceiptProps) {
    const [allPassengers, setAllPassengers] = useState<Passenger[]>([]);
    const [allTours, setAllTours] = useState<Tour[]>([]);

    useEffect(() => {
        setAllPassengers(JSON.parse(localStorage.getItem("ytl_passengers") || JSON.stringify(mockPassengers)));
        setAllTours(JSON.parse(localStorage.getItem("ytl_tours") || JSON.stringify(mockTours)));
    }, []);

    const passenger = allPassengers.find(p => p.id === reservation.passengerIds[0]);
    const tour = allTours.find(t => t.id === reservation.tripId);
    
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    const receiptNumber = reservation.id.substring(0, 8);

    const paidAmount = reservation.installments?.details
        .filter(inst => inst.isPaid)
        .reduce((sum, inst) => sum + inst.amount, 0) || 0;

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] text-black font-sans text-sm p-8 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-300">
            <div className="flex items-center gap-4">
                 <div className="w-20 h-20 flex-shrink-0">
                    <Logo/>
                </div>
            </div>
            <div className="border border-black p-2 text-center w-48">
                <h2 className="font-bold text-lg">RECIBO</h2>
                <p className="font-bold text-2xl">{receiptNumber}</p>
                <p className="text-xs mt-1">Doc. No válido como factura</p>
                <p className="text-xs font-semibold">DINERO EN TRANSITO</p>
            </div>
        </div>

        {/* Passenger and Date Info */}
        <div className="flex justify-between items-center mt-4">
            <div className="flex-1 space-y-2">
                <div className="flex items-center">
                    <span className="w-20">Señor/es:</span>
                    <div className="border-b border-gray-400 flex-1 ml-2 p-1">{passenger?.fullName}</div>
                </div>
                <div className="flex items-center">
                    <span className="w-20">Teléfono:</span>
                    <div className="border-b border-gray-400 flex-1 ml-2 p-1">{passenger?.phone}</div>
                </div>
            </div>
            <div className="flex gap-2 ml-4">
                <div className="border border-black p-1 text-center w-12"><span className="text-xs block">DÍA</span>{day}</div>
                <div className="border border-black p-1 text-center w-12"><span className="text-xs block">MES</span>{month}</div>
                <div className="border border-black p-1 text-center w-16"><span className="text-xs block">AÑO</span>{year}</div>
            </div>
        </div>

        {/* Receipt Details */}
        <div className="mt-4 space-y-2 relative flex-grow">
            <div className="absolute right-[-3rem] top-0 bottom-0 flex items-center transform -rotate-90 origin-top-right">
                <span className="text-xs font-semibold tracking-widest text-gray-500 whitespace-nowrap">ORIGINAL PARA PASAJERO</span>
            </div>
            <div className="flex items-center">
                <span className="w-28">Recibí de:</span>
                <div className="border-b border-gray-400 flex-1 ml-2 p-1">{passenger?.fullName}</div>
            </div>
             <div className="flex items-center">
                <span className="w-28">La suma de:</span>
                <div className="border-b border-gray-400 flex-1 ml-2 p-1">{paidAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
            </div>
             <div className="flex items-center">
                <span className="w-28">En concepto de:</span>
                <div className="border-b border-gray-400 flex-1 ml-2 p-1">Seña/Pago de viaje</div>
            </div>
            <div className="flex items-center mt-4">
                 <div className="flex items-center flex-1">
                    <span className="w-28">Destino:</span>
                    <div className="border-b border-gray-400 flex-1 ml-2 p-1">{tour?.destination}</div>
                </div>
                 <div className="flex items-center w-48 ml-4">
                    <span className="w-32 text-right">cantidad de pasajeros:</span>
                    <div className="border-b border-gray-400 flex-1 ml-2 p-1 text-center">{reservation.paxCount}</div>
                </div>
            </div>
             <div className="flex items-center">
                <span className="w-28">Fecha tour:</span>
                <div className="border-b border-gray-400 flex-1 ml-2 p-1">{tour ? new Date(tour.date).toLocaleDateString('es-AR') : ''}</div>
            </div>
            
            {/* Fine print */}
            <div className="text-[8px] p-2 mt-4 border border-gray-400">
                Habitación single: tiene un costo adicional del 50% del valor total del viaje. Habitación base doble: valor estipulado arriba. Leer las condiciones generales de la empresa adjuntadas en el itinerario. Si alguno de los integrantes de la Promo decide por cualquier causa NO VIAJAR, su acompañante deberá abonar el 100% del viaje, ya que la baja se toma como renuncia a la promoción de quienes integran la reserva. <span className="font-bold">LA SEÑA NO SE DEVUELVE NI SE TRANSFIERE.</span>
            </div>
            
            {/* Total and Signatures */}
            <div className="flex justify-between items-end mt-4">
                 <div className="flex items-center">
                    <span className="font-bold text-lg p-2 bg-gray-200">TOTAL:</span>
                    <div className="border-b-2 border-black w-48 ml-2 p-1 font-bold text-lg">{reservation.finalPrice.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
                </div>
                 <div className="flex gap-16">
                     <div className="border-t border-black pt-1 w-48 text-center">Firma</div>
                     <div className="border-t border-black pt-1 w-48 text-center">Aclaración</div>
                </div>
            </div>
        </div>

        {/* Legal Footer */}
        <div className="text-[9px] space-y-2 mt-auto pt-6">
            <div>
                <h4 className="font-bold">PRECIOS:</h4>
                <p>El valor del viaje pactado al momento de la consulta se mantiene siempre y cuando se abone la seña correspondiente. A partir del pago de la misma se congela el precio y esta no sufrirá aumentos. El viaje debe estar cancelado 15 días antes de la salida. De lo contrario podría darse de baja sin previo aviso, el mismo no tiene derecho a reembolso o reclamo alguno.</p>
            </div>
            <div>
                <h4 className="font-bold">CANCELACIÓN:</h4>
                <ul className="list-disc pl-4">
                    <li>Si el viaje se cancela 30 días previos a la salida: se pierde la seña por cada pasajero dado de baja.</li>
                    <li>Si el viaje se cancela 30-15 días antes de la salida se pierde el 100% del valor abonado.</li>
                    <li>Si el viaje se cancela 15 días antes a la salidas se pierde la totalidad del dinero presentado.</li>
                </ul>
            </div>
             <div>
                <h4 className="font-bold">CAMBIOS DE FECHA:</h4>
                <p>Se podrá hacer cambio de fecha con un mes de anticipación, el costo adicional es de $50.000 por pasajero. Excepto que por fuerza mayor la empresa deba cancelar o dar de baja a la salida pactada, en ese caso se reprograma un nuevo destino.</p>
            </div>
            <div>
                <h4 className="font-bold">LIMITACIONES AL DERECHO DE PERMANENCIA:</h4>
                <p>La empresa se reserva el derecho de hacer que abandone el tour en cualquier punto del mismo todo pasajero cuya conducta, modo de obrar, estado de salud u otras razones graves a juicio de la empresa provoque peligro o cause molestias a los restantes viajeros o pueda malograr el éxito de la excursión o el normal desarrollo de la misma.</p>
            </div>
            <div>
                <h4 className="font-bold">ASISTENCIA AL VIAJERO:</h4>
                <p>La empresa deja sentado que los viajes que vende u organiza no cuentan con asistencia medica en ruta o en destino, y que ha ofrecido al pasajero la contratación de un servicio de asistencia al viajero, habiendo además informado del costo del mismo acorde a sus necesidades, no responsabilizándose por la opción del pasajero de contratarlo o no. Es responsabilidad del pasajero asistir de su propio patrimonio todos los gastos que sean necesarios para su propia atención medica o de familiares a cargo, internación, traslados, alojamiento especial, o todo lo que sea solicitado por el medico tratante.</p>
            </div>
             <div>
                <h4 className="font-bold">CONOCIMIENTO Y ACEPTACIÓN DE CONDICIONES:</h4>
                <p>Estas condiciones son entregadas por la empresa al pasajero declarando conocerlas y aceptarlas, quien recibe las presentes condiciones generales lo hace como titular de la reserva, en nombre y representación de todos pasajeros que componen la misma.</p>
            </div>
            <p className="text-center font-bold mt-4">AGENCIA YO TE LLEVO</p>
        </div>
    </div>
  );
}
