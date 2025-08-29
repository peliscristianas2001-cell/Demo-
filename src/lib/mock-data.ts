

import type { Tour, Reservation, Ticket, Employee, Passenger, AssignedCabin, BoardingPoint, Seller, CommissionSettings, Pension } from './types';

export const mockPensions: Pension[] = [
    { id: 'pension-media', name: 'Media Pensión', description: 'Incluye desayuno y cena.' },
    { id: 'pension-completa', name: 'Pensión Completa', description: 'Incluye desayuno, almuerzo y cena.' },
    { id: 'pension-desayuno', name: 'Solo Desayuno', description: 'Incluye desayuno.' },
]

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
    bus: "Via Bariloche",
    observations: "Llevar ropa de abrigo. No incluye entrada a parques nacionales.",
    cancellationPolicy: "En caso de no abordar el micro el día y hora establecida, se perderá el 100% del servicio contratado. En caso de suspender el viaje se deberá dar aviso 72 horas ANTES hábiles, caso contrario no se procederá a la reprogramación.",
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'doble_piso', count: 1, coordinator: "Angela Rojas", coordinatorPhone: "341-504-0710" },
        { id: 2, category: 'vehicles', type: 'doble_piso', count: 1, coordinator: "Marcos Gil", coordinatorPhone: "11-2233-4455" },
    ],
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
    bus: "Flecha Bus",
    observations: "No olvidar repelente de insectos y protector solar.",
    cancellationPolicy: "En caso de no abordar el micro el día y hora establecida, se perderá el 100% del servicio contratado. En caso de suspender el viaje se deberá dar aviso 72 horas ANTES hábiles, caso contrario no se procederá a la reprogramación.",
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'micro_largo', count: 1, coordinator: "Marcos Gil", coordinatorPhone: "11-2233-4455" },
    ],
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
    bus: 'Andesmar',
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'micro_bajo', count: 1, coordinator: "Coordinador a definir" },
    ]
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
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'micro_bajo', count: 1 },
        { id: 2, category: 'vehicles', type: 'combi', count: 1 },
    ],
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
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'doble_piso', count: 1 },
    ],
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
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'combi', count: 3 },
    ],
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
    transportUnits: [
        { id: 1, category: 'cruises', type: 'gran_crucero', count: 1, coordinator: "Laura Fernández", coordinatorPhone: "11-2233-4455" },
    ],
  }
];

export const mockEmployees: Employee[] = [
    { id: 'E001', name: 'Laura Fernandez', dni: '28123456', phone: '1122334455', fixedSalary: 150000 },
    { id: 'E002', name: 'Marcos Gil', dni: '30654987', phone: '1166778899', fixedSalary: 150000 },
    { id: 'E003', name: 'Sofia Acosta', dni: '35789123', phone: '1133445566', fixedSalary: 140000 },
    { id: 'E004', name: 'Jose Luis Godoy', dni: '43580345', phone: '', password: '@Vector2016' },
    { id: 'E000', name: 'Angela Rojas', dni: '99999999', phone: '1111111111', password: 'AngelaRojasYTL' }
]

export const mockSellers: Seller[] = [
    { id: 'S001', name: 'Agencia Viaja+', dni: '30111222', phone: '1122334455', useFixedCommission: false },
    { id: 'S002', name: 'Turismo Veloz', dni: '30333444', phone: '1166778899', useFixedCommission: true, fixedCommissionRate: 15 },
]

export const mockCommissionSettings: CommissionSettings = {
    rules: [
        { id: 'C01', from: 1, to: 4, rate: 5 },
        { id: 'C02', from: 5, to: 'infinite', rate: 10 }
    ]
}

export const mockBoardingPoints: BoardingPoint[] = [
    { id: 'BP01', name: 'Terminal de Omnibus Rosario' },
    { id: 'BP02', name: 'Cruce Alberdi (Rosario)' },
    { id: 'BP03', name: 'Plaza del Soldado (Santa Fe)' },
    { id: 'BP04', name: 'Terminal de Omnibus Parana' },
    { id: 'BP05', name: 'Shell San Lorenzo (Autopista)' },
];

export const mockPassengers: Passenger[] = [
    { id: "P001", fullName: "Juan Perez", dni: "30123456", dob: new Date('1983-05-10'), phone: "1158963214", family: "Perez", nationality: "Argentina", tierId: "adult", boardingPointId: "BP02" },
    { id: "P002", fullName: "Maria Garcia", dni: "32654987", dob: new Date('1987-11-22'), phone: "1147859632", family: "Garcia", nationality: "Argentina", tierId: "adult" },
    { id: "P003", fullName: "Carlos Lopez", dni: "28789123", dob: new Date('1980-01-15'), phone: "1132145698", family: "Lopez", nationality: "Argentina", tierId: "adult" },
    { id: "P004", fullName: "Ana Martinez", dni: "35987654", dob: new Date('1992-09-30'), phone: "1154789632", family: "Lopez", nationality: "Argentina", tierId: "adult" },
    { id: "P005", fullName: "Lucia Hernandez", dni: "38456789", dob: new Date('1995-07-18'), phone: "1165893214", family: "Hernandez", nationality: "Argentina", tierId: "adult", boardingPointId: "BP01" },
    { id: "P006", fullName: "Jorge Rodriguez", dni: "25123789", dob: new Date('1975-03-05'), phone: "1121458796", family: "Rodriguez", nationality: "Argentina", tierId: "adult" },
    { id: "P007", fullName: "Laura Perez", dni: "45123456", dob: new Date('2015-08-12'), phone: "1158963214", family: "Perez", nationality: "Argentina", tierId: "T1_CHILD" },
    { id: "P008", fullName: "Jose Luis Godoy", dni: "43580345", dob: new Date('2001-08-11'), phone: "", family: "Godoy", nationality: "Argentina", tierId: "adult", password: '@Vector2016' },
    { id: "P009", fullName: "Angela Rojas", dni: "99999999", dob: new Date('1990-01-01'), phone: "1111111111", family: "Rojas", nationality: "Argentina", tierId: "adult", password: 'AngelaRojasYTL' },
    { id: "P29696897", fullName: "Marcela Alejandra Almada", dni: "29696897", family: "Almada", nationality: "Argentina", tierId: "adult" },
    { id: "P4099656", fullName: "Justa Trinidad Alarcon", dni: "4099656", family: "Alarcon", nationality: "Argentina", tierId: "adult" },
    { id: "P16574022", fullName: "Nelida Haydee Almada", dni: "16574022", family: "Almada", nationality: "Argentina", tierId: "adult" },
    { id: "P17052181", fullName: "Delia Ester Almada", dni: "17052181", family: "Almada", nationality: "Argentina", tierId: "adult" },
    { id: "P22050349", fullName: "Alejandra Aranda", dni: "22050349", family: "Aranda", nationality: "Argentina", tierId: "adult" },
    { id: "P20603611", fullName: "Silvia Cortez", dni: "20603611", family: "Cortez", nationality: "Argentina", tierId: "adult" },
    { id: "P18559909", fullName: "Claudia Ragonese", dni: "18559909", family: "Ragonese", nationality: "Argentina", tierId: "adult" },
    { id: "P34175101", fullName: "Emiliano Espinosa", dni: "34175101", family: "Espinosa", nationality: "Argentina", tierId: "adult" },
    { id: "P33845467", fullName: "Daniela Gracia", dni: "33845467", family: "Gracia", nationality: "Argentina", tierId: "adult" },
    { id: "P13715320", fullName: "Adriana Silvia Rodriguez", dni: "13715320", family: "Rodriguez", nationality: "Argentina", tierId: "adult" },
    { id: "P14110412", fullName: "Mirta Tordini", dni: "14110412", family: "Tordini", nationality: "Argentina", tierId: "adult" },
    { id: "P12887938", fullName: "Lucrecia Ines Winkler", dni: "12887938", family: "Winkler", nationality: "Argentina", tierId: "adult" },
    { id: "P22444356", fullName: "Liliana Noemi Almada", dni: "22444356", family: "Almada", nationality: "Argentina", tierId: "adult" },
    { id: "P36369558", fullName: "Nadia Celeste Loza", dni: "36369558", family: "Loza", nationality: "Argentina", tierId: "adult" },
    { id: "P36359274", fullName: "Lucas Armando Coronel", dni: "36359274", family: "Coronel", nationality: "Argentina", tierId: "adult" },
    { id: "P11721289", fullName: "Susana Rosario Zucaro", dni: "11721289", family: "Zucaro", nationality: "Argentina", tierId: "adult" },
    { id: "P22010024", fullName: "Silvina Rivas", dni: "22010024", family: "Rivas", nationality: "Argentina", tierId: "adult" },
    { id: "P18201229", fullName: "Maria Elena Campo", dni: "18201229", family: "Campo", nationality: "Argentina", tierId: "adult" },
    { id: "P6186220", fullName: "Juan Angel Glardon", dni: "6186220", family: "Glardon", nationality: "Argentina", tierId: "adult" },
    { id: "P13077763", fullName: "Marta Sanchez", dni: "13077763", family: "Sanchez", nationality: "Argentina", tierId: "adult" },
    { id: "P11573201", fullName: "Edgar Galloso", dni: "11573201", family: "Galloso", nationality: "Argentina", tierId: "adult" },
    { id: "P14288220", fullName: "Ruben Luis Gomez", dni: "14288220", family: "Gomez", nationality: "Argentina", tierId: "adult" },
    { id: "P14023050", fullName: "Laura Patricia Gutierrez", dni: "14023050", family: "Gutierrez", nationality: "Argentina", tierId: "adult" },
    { id: "P25079134", fullName: "Lorena Ines Monoyo", dni: "25079134", family: "Monoyo", nationality: "Argentina", tierId: "adult" },
    { id: "P26761045", fullName: "Diego Hernan Sire", dni: "26761045", family: "Sire", nationality: "Argentina", tierId: "adult" },
    { id: "P11309159", fullName: "Jose Fernandez", dni: "11309159", family: "Fernandez", nationality: "Argentina", tierId: "adult" },
    { id: "P12115246", fullName: "Lilian Catalina Reinaud", dni: "12115246", family: "Reinaud", nationality: "Argentina", tierId: "adult" },
    { id: "P17934853", fullName: "Olga Lucrecia Arredondo", dni: "17934853", family: "Arredondo", nationality: "Argentina", tierId: "adult" },
    { id: "P16387656", fullName: "Esther Badalotti", dni: "16387656", family: "Badalotti", nationality: "Argentina", tierId: "adult" },
    { id: "P11899527", fullName: "Irma Tacca", dni: "11899527", family: "Tacca", nationality: "Argentina", tierId: "adult" },
    { id: "P17301781", fullName: "Griselda De Angelis", dni: "17301781", family: "Angelis", nationality: "Argentina", tierId: "adult" },
    { id: "P6380456", fullName: "Beatriz Ferraris", dni: "6380456", family: "Ferraris", nationality: "Argentina", tierId: "adult" },
    { id: "P11173100", fullName: "Elsa Raquel Reigert", dni: "11173100", family: "Reigert", nationality: "Argentina", tierId: "adult" },
    { id: "P11761617", fullName: "Luis Alberto Ferraris", dni: "11761617", family: "Ferraris", nationality: "Argentina", tierId: "adult" },
    { id: "P13245400", fullName: "Ramona Ana Almada", dni: "13245400", family: "Almada", nationality: "Argentina", tierId: "adult" },
    { id: "P33805670", fullName: "Marcos Gabriel Fernandez", dni: "33805670", family: "Fernandez", nationality: "Argentina", tierId: "adult" },
    { id: "P37576815", fullName: "Claudia Veronica Magallanes", dni: "37576815", family: "Magallanes", nationality: "Argentina", tierId: "adult" },
    { id: "P20144017", fullName: "Susana Beatriz Castaño", dni: "20144017", family: "Castaño", nationality: "Argentina", tierId: "adult" },
    { id: "P16033675", fullName: "Liliana Mendez", dni: "16033675", family: "Mendez", nationality: "Argentina", tierId: "adult" },
    { id: "P17413056", fullName: "Adrian Idalgo", dni: "17413056", family: "Idalgo", nationality: "Argentina", tierId: "adult" },
]


export const mockReservations: Reservation[] = [
    { id: "R001", tripId: "1", passenger: "Juan Perez", passengerIds: ["P001", "P007"], paxCount: 2, assignedSeats: [{seatId: "50", unit: 1}, {seatId: "51", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S001", pensionId: "media", finalPrice: 310000, boardingPointId: 'BP02' },
    { id: "R001B", tripId: "1", passenger: "Pedro Gonzalez", passengerIds: ["P001"], paxCount: 1, assignedSeats: [{seatId: "10", unit: 2}], assignedCabins: [], status: "Confirmado", paymentStatus: "Parcial", sellerId: "S002", pensionId: "pension-completa", finalPrice: 155000 },
    { id: "R002", tripId: "2", passenger: "Maria Garcia", passengerIds: ["P002"], paxCount: 1, assignedSeats: [{seatId: "7", unit: 1}], assignedCabins: [], status: "Pendiente", paymentStatus: "Pendiente", sellerId: "unassigned", finalPrice: 125000 },
    { id: "R003", tripId: "1", passenger: "Carlos Lopez", passengerIds: ["P003", "P004"], paxCount: 2, assignedSeats: [{seatId: "52", unit: 1}, {seatId: "53", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S003", pensionId: "media", finalPrice: 620000 },
    { id: "R004", tripId: "3", passenger: "Ana Martinez", passengerIds: ["P004"], paxCount: 2, assignedSeats: [], assignedCabins: [], status: "Pendiente", paymentStatus: "Pendiente", sellerId: "unassigned", finalPrice: 270000 },
    { id: "R005", tripId: "2", passenger: "Lucia Hernandez", passengerIds: ["P005"], paxCount: 3, assignedSeats: [{seatId: "30", unit: 1}, {seatId: "31", unit: 1}, {seatId: "32", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S001", finalPrice: 375000, boardingPointId: 'BP01' },
    { id: "R006", tripId: "6", passenger: "Jorge Rodriguez", passengerIds: ["P006"], paxCount: 2, assignedSeats: [{seatId: "1", unit: 1}, {seatId: "2", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S003", finalPrice: 170000 },
    { id: "R007", tripId: "7", passenger: "Jorge Rodriguez", passengerIds: ["P006"], paxCount: 1, assignedSeats: [], assignedCabins: [{cabinId: "C101", unit: 1}], status: "Confirmado", paymentStatus: "Pagado", sellerId: "S001", pensionId: "pension-completa", finalPrice: 1250000 },
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
