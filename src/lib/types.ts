
export interface Tour {
  id: string;
  destination: string;
  date: Date;
  price: number;
  flyerUrl: string;
  totalSeats: number; // Seats per bus
  busCount: number;
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

export type VoucherStatus = "Activo" | "Canjeado" | "Expirado";

export type Voucher = {
    id: string;
    title: string;
    code: string;
    value: number;
    status: VoucherStatus;
    expiryDate: Date;
    quantity: number; // Number of times this voucher can be used
    
    // Design properties
    width: number;
    height: number;
    backgroundColor: string;
    imageUrl?: string;

    // Content properties
    recipientName?: string;
    senderName?: string;
    message?: string;

    // Visibility properties
    visibility: "all" | "registered";
    minTrips?: number; // Minimum number of trips for registered users
}

    