

import type { Tour, Reservation, Ticket, AssignedSeat, Seller, Passenger, AssignedCabin, BoardingPoint } from './types';

// Let's assume current date is late 2024, setting dates for 2025/2026
export const mockTours: Tour[] = [
  {
    id: '1',
    destination: 'Bariloche, Patagonia',
    date: new Date('2025-08-15T09:00:00'),
    price: 150000,
    flyerUrl: 'https://placehold.co/400x500.png',
    flyerType: 'image',
    origin: "Rosario",
    nights: 5,
    roomType: "Doble / Triple",
    departurePoint: "Terminal de Ómnibus",
    platform: "12",
    presentationTime: "08:30",
    departureTime: "09:00",
    bus: "Cama Ejecutivo",
    observations: "Llevar ropa de abrigo. No incluye entrada a parques nacionales.",
    cancellationPolicy: "En caso de no abordar el micro el día y hora establecida, se perderá el 100% del servicio contratado. En caso de suspender el viaje se deberá dar aviso 72 horas ANTES hábiles, caso contrario no se procederá a la reprogramación.",
    coordinator: "Angela Rojas",
    coordinatorPhone: "341-504-0710",
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
    flyerType: 'image',
    origin: "Buenos Aires",
    nights: 3,
    roomType: "Doble",
    departurePoint: "Terminal Dellepiane",
    platform: "5",
    presentationTime: "20:30",
    departureTime: "21:00",
    bus: "Semicama",
    observations: "No olvidar repelente de insectos y protector solar.",
    cancellationPolicy: "En caso de no abordar el micro el día y hora establecida, se perderá el 100% del servicio contratado. En caso de suspender el viaje se deberá dar aviso 72 horas ANTES hábiles, caso contrario no se procederá a la reprogramación.",
    coordinator: "Marcos Gil",
    coordinatorPhone: "11-2233-4455",
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
    flyerType: 'image',
    origin: "Córdoba",
    nights: 4,
    bus: 'Cama',
    vehicles: { 'micro_bajo': 1 },
    pension: { active: true, type: 'Desayuno', description: "Desayuno buffet."}
  },
  {
    id: '4',
    destination: 'Quebrada de Humahuaca, Jujuy',
    date: new Date('2025-11-12T08:00:00'),
    price: 180000,
    flyerUrl: 'https://placehold.co/400x500.png',
    flyerType: 'image',
    origin: "Salta",
    nights: 6,
    vehicles: { 'micro_bajo': 1, 'combi': 1 },
  },
  {
    id: '5',
    destination: 'El Calafate, Santa Cruz',
    date: new Date('2026-02-20T22:00:00'),
    price: 250000,
    flyerUrl: 'https://placehold.co/400x500.png',
    flyerType: 'image',
    origin: "Buenos Aires",
    nights: 7,
    vehicles: { 'doble_piso': 1 },
  },
  {
    id: '6',
    destination: 'Mar del Plata, Buenos Aires',
    date: new Date('2026-01-15T07:00:00'),
    price: 85000,
    flyerUrl: 'https://placehold.co/400x500.png',
    flyerType: 'image',
    origin: "La Plata",
    nights: 3,
    vehicles: { 'combi': 3 },
  },
  {
    id: '7',
    destination: 'Crucero a la Antártida',
    date: new Date('2026-03-10T18:00:00'),
    price: 1250000,
    flyerUrl: 'https://placehold.co/400x500.png',
    flyerType: 'image',
    origin: "Ushuaia",
    nights: 10,
    roomType: "Camarote con balcón",
    departurePoint: "Puerto de Ushuaia",
    platform: "Muelle A",
    presentationTime: "16:00",
    departureTime: "18:00",
    bus: "N/A",
    observations: "Requiere pasaporte. Ropa de muy alto abrigo es indispensable.",
    cancellationPolicy: "Cancelaciones con menos de 90 días de antelación pierden el 100% del valor.",
    coordinator: "Laura Fernández",
    coordinatorPhone: "11-2233-4455",
    cruises: { 'gran_crucero': 1 },
    insurance: { active: true, cost: 80000, coverage: "Cobertura de alta complejidad y evacuación", minAge: 18, maxAge: 70 },
    pension: { active: true, type: 'Completa', description: "Todas las comidas incluidas."},
  }
];

export const mockSellers: Seller[] = [
    { id: 'S001', name: 'Laura Fernández', dni: '28123456', phone: '1122334455', commission: 10 },
    { id: 'S002', name: 'Marcos Gil', dni: '30654987', phone: '1166778899', commission: 12 },
    { id: 'S003', name: 'Sofía Acosta', dni: '35789123', phone: '1133445566', commission: 10 },
    { id: 'S004', name: 'Jose Luis Godoy', dni: '43580345', phone: '', commission: 10, password: '@Vector2016' },
    { id: 'S000', name: 'Angela Rojas', dni: '99999999', phone: '1111111111', commission: 15, password: 'AngelaRojasYTL' }
]

export const mockBoardingPoints: BoardingPoint[] = [
    { id: 'BP01', name: 'Terminal de Ómnibus Rosario' },
    { id: 'BP02', name: 'Cruce Alberdi (Rosario)' },
    { id: 'BP03', name: 'Plaza del Soldado (Santa Fe)' },
    { id: 'BP04', name: 'Terminal de Ómnibus Paraná' },
    { id: 'BP05', name: 'Shell San Lorenzo (Autopista)' },
];

export const mockPassengers: Passenger[] = [
    { id: "P001", fullName: "Juan Pérez", dni: "30123456", dob: new Date('1983-05-10'), phone: "1158963214", family: "Pérez", nationality: "Argentina", tierId: "adult", boardingPointId: "BP02" },
    { id: "P002", fullName: "María García", dni: "32654987", dob: new Date('1987-11-22'), phone: "1147859632", family: "García", nationality: "Argentina", tierId: "adult" },
    { id: "P003", fullName: "Carlos López", dni: "28789123", dob: new Date('1980-01-15'), phone: "1132145698", family: "López", nationality: "Argentina", tierId: "adult" },
    { id: "P004", fullName: "Ana Martínez", dni: "35987654", dob: new Date('1992-09-30'), phone: "1154789632", family: "López", nationality: "Argentina", tierId: "adult" },
    { id: "P005", fullName: "Lucía Hernández", dni: "38456789", dob: new Date('1995-07-18'), phone: "1165893214", family: "Hernández", nationality: "Argentina", tierId: "adult", boardingPointId: "BP01" },
    { id: "P006", fullName: "Jorge Rodriguez", dni: "25123789", dob: new Date('1975-03-05'), phone: "1121458796", family: "Rodriguez", nationality: "Argentina", tierId: "adult" },
    { id: "P007", fullName: "Laura Pérez", dni: "45123456", dob: new Date('2015-08-12'), phone: "1158963214", family: "Pérez", nationality: "Argentina", tierId: "T1_CHILD" },
    { id: "P008", fullName: "Jose Luis Godoy", dni: "43580345", dob: new Date('2001-08-11'), phone: "", family: "Godoy", nationality: "Argentina", tierId: "adult", password: '@Vector2016' },
    { id: "P009", fullName: "Angela Rojas", dni: "99999999", dob: new Date('1990-01-01'), phone: "1111111111", family: "Rojas", nationality: "Argentina", tierId: "adult", password: 'AngelaRojasYTL' },
]


export const mockReservations: Reservation[] = [
    { id: "R001", tripId: "1", passenger: "Juan Pérez", passengerIds: ["P001", "P007"], paxCount: 2, assignedSeats: [{seatId: "50", unit: 1}, {seatId: "51", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S001", finalPrice: 310000, boardingPointId: 'BP02' },
    { id: "R001B", tripId: "1", passenger: "Pedro Gonzalez", passengerIds: ["P001"], paxCount: 1, assignedSeats: [{seatId: "10", unit: 2}], assignedCabins: [], status: "Confirmado", paymentStatus: "Parcial", sellerId: "S002", finalPrice: 155000 },
    { id: "R002", tripId: "2", passenger: "María García", passengerIds: ["P002"], paxCount: 1, assignedSeats: [{seatId: "7", unit: 1}], assignedCabins: [], status: "Pendiente", paymentStatus: "Pendiente", sellerId: "unassigned", finalPrice: 125000 },
    { id: "R003", tripId: "1", passenger: "Carlos López", passengerIds: ["P003", "P004"], paxCount: 2, assignedSeats: [{seatId: "52", unit: 1}, {seatId: "53", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S003", finalPrice: 620000 },
    { id: "R004", tripId: "3", passenger: "Ana Martínez", passengerIds: ["P004"], paxCount: 2, assignedSeats: [], assignedCabins: [], status: "Pendiente", paymentStatus: "Pendiente", sellerId: "unassigned", finalPrice: 270000 },
    { id: "R005", tripId: "2", passenger: "Lucía Hernández", passengerIds: ["P005"], paxCount: 3, assignedSeats: [{seatId: "30", unit: 1}, {seatId: "31", unit: 1}, {seatId: "32", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S001", finalPrice: 375000, boardingPointId: 'BP01' },
    { id: "R006", tripId: "6", passenger: "Jorge Rodriguez", passengerIds: ["P006"], paxCount: 2, assignedSeats: [{seatId: "1", unit: 1}, {seatId: "2", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S003", finalPrice: 170000 },
    { id: "R007", tripId: "7", passenger: "Jorge Rodriguez", passengerIds: ["P006"], paxCount: 1, assignedSeats: [], assignedCabins: [{cabinId: "C101", unit: 1}], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S001", finalPrice: 1250000 },
];

const confirmedReservations = mockReservations.filter(r => r.status === 'Confirmado');

export const mockTickets: Ticket[] = confirmedReservations.flatMap(res => {
    const ticketsForReservation: Ticket[] = [];
    const tour = mockTours.find(t => t.id === res.tripId);
    if (!tour) return [];

    const mainPassenger = mockPassengers.find(p => p.id === res.passengerIds[0]);

    if (!mainPassenger) return [];

    // Create one ticket per reservation for now, representing the group
    const ticketId = `${res.id}-TKT`;
    const assignedSeat = res.assignedSeats.length > 0 ? res.assignedSeats[0] : undefined;
    
    // We'll just use the first assigned seat/cabin for the main ticket for simplicity
    const assignment = res.assignedSeats.length > 0 
      ? res.assignedSeats[0] 
      : res.assignedCabins.length > 0 
        ? res.assignedCabins[0] 
        : { seatId: "S/A", unit: 0 };


    const qrData = {
        tId: ticketId,
        rId: res.id,
        pax: res.passenger,
        paxCount: res.paxCount,
        dni: mainPassenger.dni,
        dest: tour.destination,
        date: tour.date.toISOString(),
        asg: assignment
    };

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}`;

    ticketsForReservation.push({
        id: ticketId,
        reservationId: res.id,
        tripId: res.tripId,
        passengerName: res.passenger,
        passengerDni: mainPassenger.dni || "N/A",
        qrCodeUrl: qrCodeUrl,
        reservation: res
    });

    return ticketsForReservation;
});
