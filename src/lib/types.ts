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

export interface ExtraCost {
    id: string;
    description: string;
    amount: number;
}

export interface TourCosts {
    transport?: number;
    hotel?: number;
    extras?: ExtraCost[];
}

export interface ContactSettings {
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
    instagram?: string;
    facebook?: string;
}

export interface GeneralSettings {
    mainWhatsappNumber?: string;
    contact?: ContactSettings;
}

export interface GeoSettings {
    latitude: number;
    longitude: number;
    radiusKm: number;
}

export interface BoardingPoint {
    id: string;
    name: string;
}

export interface Tour {
  id: string;
  destination: string;
  date: Date;
  price: number;
  flyerUrl: string;
  
  origin?: string;
  nights?: number;
  roomType?: string;
  departurePoint?: string;
  platform?: string;
  presentationTime?: string;
  departureTime?: string;
  bus?: string;

  insurance?: Insurance;
  pension?: Pension;
  pricingTiers?: PricingTier[];
  costs?: TourCosts;
  
  observations?: string;
  cancellationPolicy?: string;
  coordinator?: string;
  coordinatorPhone?: string;

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

export interface Installment {
    amount: number;
    isPaid: boolean;
}

export interface Passenger {
  id: string;
  fullName: string;
  dni: string;
  dob?: Date;
  phone?: string;
  family?: string;
  nationality: string;
  tierId: string; // 'adult' or one of the pricingTier IDs
  password?: string;
  boardingPointId?: string;
}

export type Reservation = {
    id: string;
    tripId: string;
    passenger: string; // Main passenger's name for display
    passengerIds: string[]; // IDs of all passengers in the reservation
    paxCount: number; // Total number of passengers
    assignedSeats: AssignedSeat[];
    assignedCabins: AssignedCabin[];
    status: ReservationStatus;
    paymentStatus: PaymentStatus;
    sellerId: string;
    finalPrice: number;
    boardingPointId?: string;
    installments?: {
        count: number;
        details: Installment[];
    }
}

export type Ticket = {
  id: string;
  reservationId: string;
  tripId: string;
  passengerName: string;
  passengerDni: string;
  qrCodeUrl: string;
  reservation: Reservation; // Include full reservation for ticket details
  boardingPointId?: string;
  boardingPoint?: BoardingPoint;
}

export type Seller = {
    id: string;
    name: string;
    dni: string;
    phone: string;
    commission: number; // Percentage
    password?: string;
}
