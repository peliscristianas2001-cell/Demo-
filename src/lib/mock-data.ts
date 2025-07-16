
import type { Tour, Reservation, Voucher } from './types';

// Let's assume current date is late 2024, setting dates for 2025/2026
export const mockTours: Tour[] = [
  {
    id: '1',
    destination: 'Bariloche, Patagonia',
    date: new Date('2025-08-15T09:00:00'),
    price: 150000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    busCount: 2, // This trip has two buses
    occupiedSeats: [], // This will be derived from reservations
  },
  {
    id: '2',
    destination: 'Cataratas del Iguazú, Misiones',
    date: new Date('2025-09-20T21:00:00'),
    price: 125000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    busCount: 1,
    occupiedSeats: [],
  },
  {
    id: '3',
    destination: 'Mendoza, Ruta del Vino',
    date: new Date('2025-10-05T10:00:00'),
    price: 135000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    busCount: 1,
    occupiedSeats: [],
  },
  {
    id: '4',
    destination: 'Quebrada de Humahuaca, Jujuy',
    date: new Date('2025-11-12T08:00:00'),
    price: 180000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    busCount: 1,
    occupiedSeats: [],
  },
  {
    id: '5',
    destination: 'El Calafate, Santa Cruz',
    date: new Date('2025-12-01T22:00:00'),
    price: 250000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    busCount: 1,
    occupiedSeats: [],
  },
  {
    id: '6',
    destination: 'Mar del Plata, Buenos Aires',
    date: new Date('2026-01-15T07:00:00'),
    price: 85000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    busCount: 1,
    occupiedSeats: [],
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


export const mockVouchers: Voucher[] = [
  { id: "V001", code: "VERANO2025", value: 10000, status: "Activo", expiryDate: new Date("2025-03-31T23:59:59"), imageUrl: "https://placehold.co/600x400.png" },
  { id: "V002", code: "REGALOESPECIAL", value: 25000, status: "Canjeado", expiryDate: new Date("2025-12-31T23:59:59"), imageUrl: "https://placehold.co/600x400.png" },
  { id: "V003", code: "AVENTURA15", value: 15000, status: "Activo", expiryDate: new Date("2025-10-31T23:59:59"), imageUrl: "https://placehold.co/600x400.png" },
  { id: "V004", code: "EXPIRADO01", value: 5000, status: "Expirado", expiryDate: new Date("2024-01-01T23:59:59"), imageUrl: "https://placehold.co/600x400.png" },
];
