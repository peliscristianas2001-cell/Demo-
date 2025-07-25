
import type { Layout, Cell } from './layouts';

export type LayoutCategory = 'vehicles' | 'airplanes' | 'cruises';

export type LayoutItemType = string;

export interface CustomLayoutConfig {
  name: string;
  capacity: number;
  layout: Layout;
}

export interface Tour {
  id: string;
  destination: string;
  date: Date;
  price: number;
  flyerUrl: string;
  vehicles?: Partial<Record<LayoutItemType, number>>;
  airplanes?: Partial<Record<LayoutItemType, number>>;
  cruises?: Partial<Record<LayoutItemType, number>>;
}

export type ReservationStatus = "Confirmado" | "Pendiente";

export type AssignedSeat = { 
  seatId: string; 
  unit: number; // Represents the global instance number of the transport unit
};

export type AssignedCabin = {
  cabinId: string;
  unit: number;
}

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
    // This can represent seats or people in a cabin
    paxCount: number; 
    assignedSeats: AssignedSeat[];
    assignedCabins: AssignedCabin[];
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
  assignment: AssignedSeat | AssignedCabin; // Can be a seat or a cabin
  qrCodeUrl: string; // URL to a generated QR code image
}
