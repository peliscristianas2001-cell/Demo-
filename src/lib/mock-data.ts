

import type { Tour, Reservation, Ticket, AssignedSeat } from './types';

// Let's assume current date is late 2024, setting dates for 2025/2026
export const mockTours: Tour[] = [
  {
    id: '1',
    destination: 'Bariloche, Patagonia',
    date: new Date('2025-08-15T09:00:00'),
    price: 150000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'doble_piso': 2 }, 
  },
  {
    id: '2',
    destination: 'Cataratas del Iguazú, Misiones',
    date: new Date('2025-09-20T21:00:00'),
    price: 125000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'micro_largo': 1 },
  },
  {
    id: '3',
    destination: 'Mendoza, Ruta del Vino',
    date: new Date('2025-10-05T10:00:00'),
    price: 135000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'micro_bajo': 1 },
  },
  {
    id: '4',
    destination: 'Quebrada de Humahuaca, Jujuy',
    date: new Date('2025-11-12T08:00:00'),
    price: 180000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'micro_bajo': 1, 'combi': 1 },
  },
  {
    id: '5',
    destination: 'El Calafate, Santa Cruz',
    date: new Date('2026-02-20T22:00:00'),
    price: 250000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'doble_piso': 1 },
  },
  {
    id: '6',
    destination: 'Mar del Plata, Buenos Aires',
    date: new Date('2026-01-15T07:00:00'),
    price: 85000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'combi': 3 },
  },
];


export const mockReservations: Reservation[] = [
    { id: "R001", tripId: "1", passenger: "Juan Pérez", paxCount: 2, assignedSeats: [{seatId: "50", unit: 1}, {seatId: "51", unit: 1}], assignedCabins: [], status: "Confirmado" },
    { id: "R001B", tripId: "1", passenger: "Pedro Gonzalez", paxCount: 1, assignedSeats: [{seatId: "10", unit: 2}], assignedCabins: [], status: "Confirmado" },
    { id: "R002", tripId: "2", passenger: "María García", paxCount: 1, assignedSeats: [{seatId: "7", unit: 1}], assignedCabins: [], status: "Pendiente" },
    { id: "R003", tripId: "1", passenger: "Carlos López", paxCount: 4, assignedSeats: [{seatId: "52", unit: 1}, {seatId: "53", unit: 1}], assignedCabins: [], status: "Confirmado" },
    { id: "R004", tripId: "3", passenger: "Ana Martínez", paxCount: 2, assignedSeats: [], assignedCabins: [], status: "Pendiente" },
    { id: "R005", tripId: "2", passenger: "Lucía Hernández", paxCount: 3, assignedSeats: [{seatId: "30", unit: 1}, {seatId: "31", unit: 1}, {seatId: "32", unit: 1}], assignedCabins: [], status: "Confirmado" },
    { id: "R006", tripId: "6", passenger: "Jorge Rodriguez", paxCount: 2, assignedSeats: [{seatId: "1", unit: 1}, {seatId: "2", unit: 1}], assignedCabins: [], status: "Confirmado" },
];

const confirmedReservations = mockReservations.filter(r => r.status === 'Confirmado');

export const mockTickets: Ticket[] = confirmedReservations.flatMap(res => {
    // Create a ticket for each assigned seat in the reservation
    const ticketsForReservation: Ticket[] = [];
    const tour = mockTours.find(t => t.id === res.tripId);
    if (!tour) return [];

    const passengerDni = 'XX.XXX.XXX'; // Placeholder DNI

    (res.assignedSeats || []).forEach((seat, index) => {
        const ticketId = `${res.id}-S${index + 1}`;
        // Use a relative URL for navigation within the app
        const verificationUrl = `/verify/${ticketId}`;
        const qrData = new URL(verificationUrl, "https://yotellevo.app").href;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
        
        ticketsForReservation.push({
            id: ticketId,
            reservationId: res.id,
            tripId: res.tripId,
            passengerName: res.passenger,
            passengerDni: passengerDni,
            assignment: seat,
            qrCodeUrl: qrCodeUrl,
        });
    });

    (res.assignedCabins || []).forEach((cabin, index) => {
        const ticketId = `${res.id}-C${index + 1}`;
        const verificationUrl = `/verify/${ticketId}`;
        const qrData = new URL(verificationUrl, "https://yotellevo.app").href;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

        ticketsForReservation.push({
            id: ticketId,
            reservationId: res.id,
            tripId: res.tripId,
            passengerName: res.passenger,
            passengerDni: passengerDni,
            assignment: cabin,
            qrCodeUrl: qrCodeUrl,
        });
    });

    return ticketsForReservation;
});
