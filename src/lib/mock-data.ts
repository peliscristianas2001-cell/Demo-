import type { Tour } from './types';

// Let's assume current date is late 2024, setting dates for 2025
export const mockTours: Tour[] = [
  {
    id: '1',
    destination: 'Bariloche, Patagonia',
    date: new Date('2025-08-15T09:00:00'),
    price: 150000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    occupiedSeats: ['1A', '1B', '2C', '5D', '10A'],
  },
  {
    id: '2',
    destination: 'Cataratas del Iguazú, Misiones',
    date: new Date('2025-09-20T21:00:00'),
    price: 125000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    occupiedSeats: ['3A', '3B', '3C', '3D', '7A', '7B'],
  },
  {
    id: '3',
    destination: 'Mendoza, Ruta del Vino',
    date: new Date('2025-10-05T10:00:00'),
    price: 135000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    occupiedSeats: ['1A', '2B', '4C', '8D', '9A', '9B', '9C'],
  },
  {
    id: '4',
    destination: 'Quebrada de Humahuaca, Jujuy',
    date: new Date('2025-11-12T08:00:00'),
    price: 180000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    occupiedSeats: ['1C', '1D', '5A', '5B'],
  },
  {
    id: '5',
    destination: 'El Calafate, Santa Cruz',
    date: new Date('2025-12-01T22:00:00'),
    price: 250000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    occupiedSeats: [],
  },
  {
    id: '6',
    destination: 'Mar del Plata, Buenos Aires',
    date: new Date('2026-01-15T07:00:00'),
    price: 85000,
    flyerUrl: 'https://placehold.co/400x500.png',
    totalSeats: 40,
    occupiedSeats: ['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D', '3A', '3B'],
  },
];
