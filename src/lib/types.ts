
import type { Layout, Cell } from './layouts';

export type LayoutCategory = 'vehicles' | 'airplanes' | 'cruises';

export type LayoutItemType = string;

export interface CustomLayoutConfig {
  name: string;
  capacity: number;
  layout: Layout;
}

export interface Insurance {
  active: boolean;
  coverage: string;
  cost: number;
  minAge: number;
  maxAge: number;
}

export interface Pension {
  active: boolean;
  type: 'Media' | 'Completa' | 'Desayuno';
  description: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
}

export interface Tour {
  id: string;
  destination: string;
  date: Date;
  price: number;
  flyerUrl: string;
  insurance?: Insurance;
  pension?: Pension;
  pricingTiers?: PricingTier[];
  vehicles?: Partial<Record<LayoutItemType, number>>;
  airplanes?: Partial<Record<LayoutItemType, number>>;
  cruises?: Partial<Record<LayoutItemType, number>>;
}

export type ReservationStatus = "Confirmado" | "Pendiente";
export type PaymentStatus = "Pagado" | "Parcial" | "Pendiente";

export type AssignedSeat = { 
  seatId: string; 
  unit: number; 
};

export type AssignedCabin = {
  cabinId: string;
  unit: number;
}

export interface Passenger {
  id: string;
  fullName: string;
  dni: string;
  dob?: Date;
  nationality: string;
  tierId: string; // 'adult' or one of the pricingTier IDs
}

export type Reservation = {
    id: string;
    tripId: string;
    passenger: string;
    paxCount: number; 
    assignedSeats: AssignedSeat[];
    assignedCabins: AssignedCabin[];
    status: ReservationStatus;
    paymentStatus: PaymentStatus;
    sellerId: string;
    finalPrice: number;
}

export type Ticket = {
  id: string;
  reservationId: string;
  tripId: string;
  passengerName: string;
  passengerDni: string;
  assignment: AssignedSeat | AssignedCabin;
  qrCodeUrl: string;
}

export type Seller = {
    id: string;
    name: string;
    dni: string;
    phone: string;
    commission: number; // Percentage
}
