

import type { Layout, Cell } from './layouts';

export type LayoutCategory = 'vehicles' | 'airplanes' | 'cruises';

export type LayoutItemType = string;

export interface CustomLayoutConfig {
  name: string;
  capacity: number;
  layout: Layout;
}

export interface Pension {
  id: string;
  name: string;
  description: string;
}

export interface RoomType {
  id: string;
  name: string;
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

export interface CustomExpense {
    id: string;
    description: string;
    amount: number;
    date: Date;
}

export interface ExternalCommission {
    id: string;
    description: string;
    amount: number;
    date: Date;
}

export interface ExcursionIncome {
    id: string;
    description: string;
    amount: number;
    date: Date;
}

export interface TransportCost {
    unitId: number;
    category: LayoutCategory;
    amount: number;
}

export interface TourCosts {
    transport?: TransportCost[];
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
    calendarDownloadFolder?: string;
    reportDownloadFolder?: string;
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

export interface TransportUnit {
    id: number;
    category: LayoutCategory;
    type: LayoutItemType;
    count: number;
    coordinator?: string;
    coordinatorPhone?: string;
}

export interface Insurance {
    active: boolean;
    cost: number;
    minAge: number;
    maxAge: number;
}

export interface Flyer {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface Tour {
  id: string;
  destination: string;
  date: Date;
  price: number;
  backgroundImage?: string;
  
  origin?: string;
  nights?: number;
  departurePoint?: string;
  platform?: string;
  presentationTime?: string;
  departureTime?: string;
  bus?: string;
  coordinator?: string; // This can be the main coordinator if a unit doesn't have one
  coordinatorPhone?: string;
  roomType?: string; // e.g. 'Doble', 'Triple' etc.
  insurance?: Insurance;

  pricingTiers?: PricingTier[];
  costs?: TourCosts;
  
  observations?: string;
  cancellationPolicy?: string;
  
  transportUnits?: TransportUnit[];
  flyers?: Flyer[];

  // Deprecated fields, kept for potential data migration but should not be used for new logic
  flyerUrl?: string;
  flyerType?: 'image' | 'video';
  vehicles?: Partial<Record<LayoutItemType, number>>;
  airplanes?: Partial<Record<LayoutItemType, number>>;
  cruises?: Partial<Record<LayoutItemType, number>>;
}

export type ReservationStatus = "Confirmado" | "Pendiente";
export type PaymentStatus = "Pagado" | "Parcial" | "Pendiente";
export type PaymentMethod = "Tarjeta" | "Transferencia" | "Efectivo";

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
    paymentMethod?: PaymentMethod;
}

export interface Passenger {
  id: string; // Firebase Auth UID
  fullName: string;
  email?: string;
  dni: string;
  dob?: Date;
  phone?: string;
  family?: string;
  nationality: string;
  tierId: string; // 'adult' or one of the pricingTier IDs
  boardingPointId?: string;
  // password field is no longer needed here as it's handled by Firebase Auth
}

export type Reservation = {
    id: string;
    tripId: string;
    passenger: string; // Main passenger's name for display
    passengerIds: string[]; // IDs of all passengers in the reservation
    insuredPassengerIds?: string[]; // IDs of passengers who opted for insurance
    paxCount: number; // Total number of passengers
    assignedSeats: AssignedSeat[];
    assignedCabins: AssignedCabin[];
    status: ReservationStatus;
    paymentStatus: PaymentStatus;
    sellerId: string;
    pensionId?: string;
    finalPrice: number;
    boardingPointId?: string;
    roomTypeId?: string;
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
}


// --- New Employee and Seller Types ---

export interface Employee {
  id: string;
  name: string;
  dni: string;
  phone: string;
  password?: string;
  fixedSalary?: number;
  email?: string;
}

export interface Seller {
  id: string;
  name: string;
  dni: string;
  phone: string;
  useFixedCommission: boolean;
  fixedCommissionRate?: number;
}

export interface CommissionRule {
    id: string;
    from: number;
    to: number | 'infinite';
    rate: number;
}

export interface CommissionSettings {
    rules: CommissionRule[];
}

// --- History & Archiving Types ---
export interface HistoryItem {
  id: string; // Can be tour id for reports, or a custom id for calendars
  name: string; // Display name, e.g., "Bariloche - 15/08/2025" or "Calendario 2025"
  data: any; // The actual data, e.g., ReportData or Bubble[]
  savedAt: string; // ISO date string
}
