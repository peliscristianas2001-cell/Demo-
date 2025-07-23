

import type { Tour, Reservation, Ticket } from './types';

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
    { id: "R001", tripId: "1", tripDestination: "Bariloche, Patagonia", passenger: "Juan Pérez", seatsCount: 2, assignedSeats: [{seatId: "1A", bus: 1}, {seatId: "1B", bus: 1}], status: "Confirmado" },
    { id: "R001B", tripId: "1", tripDestination: "Bariloche, Patagonia", passenger: "Pedro Gonzalez", seatsCount: 1, assignedSeats: [{seatId: "5C", bus: 2}], status: "Confirmado" },
    { id: "R002", tripId: "2", tripDestination: "Cataratas del Iguazú, Misiones", passenger: "María García", seatsCount: 1, assignedSeats: [{seatId: "7A", bus: 1}], status: "Pendiente" },
    { id: "R003", tripId: "1", tripDestination: "Bariloche, Patagonia", passenger: "Carlos López", seatsCount: 4, assignedSeats: [{seatId: "2A", bus: 1}, {seatId: "2B", bus: 1}], status: "Confirmado" },
    { id: "R004", tripId: "3", tripDestination: "Mendoza, Ruta del Vino", passenger: "Ana Martínez", seatsCount: 2, assignedSeats: [], status: "Pendiente" },
    { id: "R005", tripId: "2", tripDestination: "Cataratas del Iguazú, Misiones", passenger: "Lucía Hernández", seatsCount: 3, assignedSeats: [{seatId: "3B", bus: 1}, {seatId: "3C", bus: 1}, {seatId: "3D", bus: 1}], status: "Confirmado" },
];

const confirmedReservations = mockReservations.filter(r => r.status === 'Confirmado');
const associatedTours = mockTours.reduce((acc, tour) => {
    acc[tour.id] = tour;
    return acc;
}, {} as Record<string, Tour>);

export const mockTickets: Ticket[] = confirmedReservations.flatMap(res => {
    const tour = associatedTours[res.tripId];
    // Create a ticket for each assigned seat in the reservation
    return res.assignedSeats.map((seat, index) => ({
        id: `${res.id}-T${index + 1}`,
        reservationId: res.id,
        tripId: res.tripId,
        tripDestination: res.tripDestination,
        tripDate: tour.date,
        // For simplicity, we assume the main passenger name for all tickets in a reservation
        // A more complex implementation would have individual passenger data per seat
        passengerName: res.passenger,
        passengerDni: 'XX.XXX.XXX', // Placeholder DNI
        seat: seat,
        qrCodeUrl: 'https://placehold.co/150x150.png', // Placeholder QR Code
    }));
});
