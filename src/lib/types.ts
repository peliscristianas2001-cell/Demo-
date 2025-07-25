
import type { Layout } from './layouts';

export type VehicleType = 'doble_piso' | 'micro_largo' | 'micro_bajo' | 'combi' | string;

export interface CustomVehicleConfig {
  name: string;
  seats: number;
  layout: Layout;
}

export interface Tour {
  id: string;
  destination: string;
  date: Date;
  price: number;
  flyerUrl: string;
  vehicles: Partial<Record<VehicleType, number>>;
}

export type ReservationStatus = "Confirmado" | "Pendiente";

export type AssignedSeat = { 
  seatId: string; 
  bus: number;
};

export interface Passenger {
  fullName: string
  dni: string
  dob?: Date
  nationality: string
}

export type Reservation = {
    id: string;
    tripId: string;
    tripDestination: string;
    passenger: string;
    seatsCount: number;
    assignedSeats: AssignedSeat[];
    status: ReservationStatus;
}

export type Ticket = {
  id: string;
  reservationId: string;
  tripId: string;
  tripDestination: string;
  tripDate: Date;
  passengerName: string;
  passengerDni: string;
  seat: AssignedSeat;
  qrCodeUrl: string; // URL to a generated QR code image
}
