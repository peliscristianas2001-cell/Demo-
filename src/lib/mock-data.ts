

import type { Tour, Reservation, Ticket, AssignedSeat, Seller, Passenger } from './types';

// Let's assume current date is late 2024, setting dates for 2025/2026
export const mockTours: Tour[] = [
  {
    id: '1',
    destination: 'Bariloche, Patagonia',
    date: new Date('2025-08-15T09:00:00'),
    price: 150000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'doble_piso': 2 }, 
    insurance: { active: true, cost: 5000, coverage: "Cobertura médica básica", minAge: 0, maxAge: 75 },
    pension: { active: true, type: 'Media', description: "Desayuno y cena incluidos."},
    pricingTiers: [
      { id: 'T1_CHILD', name: 'Niño', price: 120000 },
      { id: 'T1_RETIREE', name: 'Jubilado', price: 135000 },
    ],
    costs: {
      transport: 1200000,
      hotel: 800000,
      extras: [
        { id: 'E1', description: 'Excursión Circuito Chico', amount: 50000 },
        { id: 'E2', description: 'Guía local', amount: 30000 },
      ]
    }
  },
  {
    id: '2',
    destination: 'Cataratas del Iguazú, Misiones',
    date: new Date('2025-09-20T21:00:00'),
    price: 125000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'micro_largo': 1 },
    pricingTiers: [
      { id: 'T2_CHILD', name: 'Menor', price: 100000 },
    ],
    costs: {
        transport: 800000,
        hotel: 500000
    }
  },
  {
    id: '3',
    destination: 'Mendoza, Ruta del Vino',
    date: new Date('2025-10-05T10:00:00'),
    price: 135000,
    flyerUrl: 'https://placehold.co/400x500.png',
    vehicles: { 'micro_bajo': 1 },
    pension: { active: true, type: 'Desayuno', description: "Desayuno buffet."}
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

export const mockSellers: Seller[] = [
    { id: 'S001', name: 'Laura Fernández', dni: '28123456', phone: '1122334455', commission: 10 },
    { id: 'S002', name: 'Marcos Gil', dni: '30654987', phone: '1166778899', commission: 12 },
    { id: 'S003', name: 'Sofía Acosta', dni: '35789123', phone: '1133445566', commission: 10 },
    { id: 'S004', name: 'Jose Luis Godoy', dni: '43580345', phone: '', commission: 10, password: '@Vector2016' },
    { id: 'S000', name: 'Angela Rojas', dni: '99999999', phone: '1111111111', commission: 15, password: 'AngelaRojasYTL' }
]

export const mockPassengers: Passenger[] = [
    { id: "P001", fullName: "Juan Pérez", dni: "30123456", dob: new Date('1983-05-10'), phone: "1158963214", family: "Pérez", nationality: "Argentina", tierId: "adult" },
    { id: "P002", fullName: "María García", dni: "32654987", dob: new Date('1987-11-22'), phone: "1147859632", family: "García", nationality: "Argentina", tierId: "adult" },
    { id: "P003", fullName: "Carlos López", dni: "28789123", dob: new Date('1980-01-15'), phone: "1132145698", family: "López", nationality: "Argentina", tierId: "adult" },
    { id: "P004", fullName: "Ana Martínez", dni: "35987654", dob: new Date('1992-09-30'), phone: "1154789632", family: "López", nationality: "Argentina", tierId: "adult" },
    { id: "P005", fullName: "Lucía Hernández", dni: "38456789", dob: new Date('1995-07-18'), phone: "1165893214", family: "Hernández", nationality: "Argentina", tierId: "adult" },
    { id: "P006", fullName: "Jorge Rodriguez", dni: "25123789", dob: new Date('1975-03-05'), phone: "1121458796", family: "Rodriguez", nationality: "Argentina", tierId: "adult" },
    { id: "P007", fullName: "Laura Pérez", dni: "45123456", dob: new Date('2015-08-12'), phone: "1158963214", family: "Pérez", nationality: "Argentina", tierId: "T1_CHILD" },
    { id: "P008", fullName: "Jose Luis Godoy", dni: "43580345", dob: new Date('2001-08-11'), phone: "", family: "Godoy", nationality: "Argentina", tierId: "adult" },
    { id: "P009", fullName: "Angela Rojas", dni: "99999999", dob: new Date('1990-01-01'), phone: "1111111111", family: "Rojas", nationality: "Argentina", tierId: "adult" },
]


export const mockReservations: Reservation[] = [
    { id: "R001", tripId: "1", passenger: "Juan Pérez", passengerIds: ["P001", "P007"], paxCount: 2, assignedSeats: [{seatId: "50", unit: 1}, {seatId: "51", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S001", finalPrice: 310000 },
    { id: "R001B", tripId: "1", passenger: "Pedro Gonzalez", passengerIds: ["P001"], paxCount: 1, assignedSeats: [{seatId: "10", unit: 2}], assignedCabins: [], status: "Confirmado", paymentStatus: "Parcial", sellerId: "S002", finalPrice: 155000 },
    { id: "R002", tripId: "2", passenger: "María García", passengerIds: ["P002"], paxCount: 1, assignedSeats: [{seatId: "7", unit: 1}], assignedCabins: [], status: "Pendiente", paymentStatus: "Pendiente", sellerId: "unassigned", finalPrice: 125000 },
    { id: "R003", tripId: "1", passenger: "Carlos López", passengerIds: ["P003", "P004"], paxCount: 2, assignedSeats: [{seatId: "52", unit: 1}, {seatId: "53", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S003", finalPrice: 620000 },
    { id: "R004", tripId: "3", passenger: "Ana Martínez", passengerIds: ["P004"], paxCount: 2, assignedSeats: [], assignedCabins: [], status: "Pendiente", paymentStatus: "Pendiente", sellerId: "unassigned", finalPrice: 270000 },
    { id: "R005", tripId: "2", passenger: "Lucía Hernández", passengerIds: ["P005"], paxCount: 3, assignedSeats: [{seatId: "30", unit: 1}, {seatId: "31", unit: 1}, {seatId: "32", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S001", finalPrice: 375000 },
    { id: "R006", tripId: "6", passenger: "Jorge Rodriguez", passengerIds: ["P006"], paxCount: 2, assignedSeats: [{seatId: "1", unit: 1}, {seatId: "2", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S003", finalPrice: 170000 },
];

const confirmedReservations = mockReservations.filter(r => r.status === 'Confirmado');

export const mockTickets: Ticket[] = confirmedReservations.flatMap(res => {
    const ticketsForReservation: Ticket[] = [];
    const tour = mockTours.find(t => t.id === res.tripId);
    if (!tour) return [];

    const passengerDni = 'XX.XXX.XXX'; // Placeholder DNI

    const generateTicketsForAssignments = (assignments: (AssignedSeat | { cabinId: string, unit: number })[], type: 'seat' | 'cabin') => {
        assignments.forEach((assignment, index) => {
            const isSeat = type === 'seat';
            const assignmentId = isSeat ? (assignment as AssignedSeat).seatId : (assignment as { cabinId: string }).cabinId;
            const ticketId = `${res.id}-${isSeat ? 'S' : 'C'}${index + 1}`;
            
            const qrData = {
                tId: ticketId,
                rId: res.id,
                pax: res.passenger,
                dni: passengerDni,
                dest: tour.destination,
                date: tour.date.toISOString(),
                asg: {
                    type: type,
                    val: assignmentId,
                    unit: assignment.unit,
                },
            };

            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}`;

            ticketsForReservation.push({
                id: ticketId,
                reservationId: res.id,
                tripId: res.tripId,
                passengerName: res.passenger,
                passengerDni: passengerDni,
                assignment: assignment as any, // Cast because the structures are compatible
                qrCodeUrl: qrCodeUrl,
            });
        });
    };

    if (res.assignedSeats) {
        generateTicketsForAssignments(res.assignedSeats, 'seat');
    }
    if (res.assignedCabins) {
        generateTicketsForAssignments(res.assignedCabins, 'cabin');
    }

    return ticketsForReservation;
});

    