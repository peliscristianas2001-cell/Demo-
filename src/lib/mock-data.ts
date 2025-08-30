

import type { Tour, Reservation, Ticket, Employee, Passenger, AssignedCabin, BoardingPoint, Seller, CommissionSettings, Pension, RoomType } from './types';

export const mockPensions: Pension[] = [
    { id: 'pension-media', name: 'Media Pensión', description: 'Incluye desayuno y cena.' },
    { id: 'pension-completa', name: 'Pensión Completa', description: 'Incluye desayuno, almuerzo y cena.' },
    { id: 'pension-desayuno', name: 'Solo Desayuno', description: 'Incluye desayuno.' },
]

export const mockRoomTypes: RoomType[] = [
    { id: 'RT01', name: 'Doble Matrimonial' },
    { id: 'RT02', name: 'Doble Twin' },
    { id: 'RT03', name: 'Triple' },
    { id: 'RT04', name: 'Cuádruple' },
]

export const mockBoardingPoints: BoardingPoint[] = [
    { id: 'BP01', name: 'Terminal de Omnibus Rosario' },
    { id: 'BP02', name: 'Cruce Alberdi (Rosario)' },
    { id: 'BP03', name: 'Plaza del Soldado (Santa Fe)' },
    { id: 'BP04', name: 'Terminal de Omnibus Parana' },
    { id: 'BP05', name: 'Shell San Lorenzo (Autopista)' },
];

export const mockCommissionSettings: CommissionSettings = {
    rules: [
        { id: 'C01', from: 1, to: 4, rate: 5 },
        { id: 'C02', from: 5, to: 'infinite', rate: 10 }
    ]
}

// --- NEW MOCK DATA ---

export const mockTours: Tour[] = [
  {
    id: 'T-2024-SALTA',
    destination: 'Salta & Jujuy',
    date: new Date('2024-08-15T20:00:00'),
    price: 210000,
    flyerUrl: 'https://placehold.co/400x500/A21CAF/FFFFFF.png',
    flyerType: 'image',
    origin: "Buenos Aires",
    nights: 5,
    bus: "Flecha Bus",
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'doble_piso', count: 1, coordinator: "Marcos Gil", coordinatorPhone: "341-504-0710" },
    ],
  },
  {
    id: 'T-2024-MERLO',
    destination: 'Merlo, San Luis',
    date: new Date('2024-09-20T21:30:00'),
    price: 185000,
    flyerUrl: 'https://placehold.co/400x500/3B82F6/FFFFFF.png',
    flyerType: 'image',
    origin: "Rosario",
    nights: 4,
    bus: "Andesmar",
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'micro_largo', count: 1, coordinator: "Laura Fernandez", coordinatorPhone: "11-2233-4455" },
    ],
  },
  {
    id: 'T-2025-MENDOZA',
    destination: 'Mendoza Capital',
    date: new Date('2025-01-10T19:00:00'),
    price: 250000,
    flyerUrl: 'https://placehold.co/400x500/8B5CF6/FFFFFF.png',
    flyerType: 'image',
    origin: "Córdoba",
    nights: 6,
    bus: "CATA Internacional",
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'doble_piso', count: 1, coordinator: "Sofia Acosta", coordinatorPhone: "11-3344-5566" },
        { id: 2, category: 'vehicles', type: 'combi', count: 1, coordinator: "Marcos Gil", coordinatorPhone: "341-504-0710" },
    ],
  },
   {
    id: 'T-2025-CRUCERO',
    destination: 'Crucero por Brasil',
    date: new Date('2025-02-05T18:00:00'),
    price: 950000,
    flyerUrl: 'https://placehold.co/400x500/10B981/FFFFFF.png',
    flyerType: 'image',
    origin: "Puerto de Buenos Aires",
    nights: 8,
    bus: "MSC Cruceros",
    transportUnits: [
        { id: 1, category: 'cruises', type: 'gran_crucero', count: 1, coordinator: "Angela Rojas", coordinatorPhone: "11-1111-1111" },
    ],
  },
  {
    id: 'T-2024-PASADO',
    destination: 'Termas de Colón (Viaje Pasado)',
    date: new Date('2024-05-01T08:00:00'),
    price: 90000,
    flyerUrl: 'https://placehold.co/400x500/EF4444/FFFFFF.png',
    flyerType: 'image',
    origin: "Paraná",
    nights: 2,
    bus: "Empresa local",
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'micro_bajo', count: 1, coordinator: "Laura Fernandez", coordinatorPhone: "11-2233-4455" },
    ],
    costs: { transport: 500000, hotel: 300000 }
  }
];

export const mockEmployees: Employee[] = [
    { id: 'EMP-01', name: 'Laura Fernandez', dni: '28123456', phone: '1122334455', password: "password123", fixedSalary: 180000 },
    { id: 'EMP-02', name: 'Marcos Gil', dni: '30654987', phone: '1166778899', password: "password123", fixedSalary: 180000 },
    { id: 'EMP-03', name: 'Sofia Acosta', dni: '35789123', phone: '1133445566', password: "password123", fixedSalary: 175000 },
    { id: 'EMP-ADMIN', name: 'Angela Rojas', dni: '99999999', phone: '1111111111', password: 'AngelaRojasYTL' }
];

export const mockSellers: Seller[] = [
    { id: 'SELL-EXT-01', name: 'Viajes El Sol', dni: '30111222', phone: '351-555-0101', useFixedCommission: false },
    { id: 'SELL-EXT-02', name: 'Turismo CityBell', dni: '30333444', phone: '221-555-0202', useFixedCommission: true, fixedCommissionRate: 12 },
];

export const mockPassengers: Passenger[] = [
    // Familia Gonzalez
    { id: 'P-30M-GON', fullName: 'Miguel Gonzalez', dni: '30111222', dob: new Date('1983-05-10'), phone: '11-1234-5678', family: 'Gonzalez', nationality: 'Argentina', tierId: 'adult' },
    { id: 'P-32F-GON', fullName: 'Carla Rodriguez de Gonzalez', dni: '32222333', dob: new Date('1986-08-15'), phone: '11-1234-5678', family: 'Gonzalez', nationality: 'Argentina', tierId: 'adult', password: 'password' },
    { id: 'P-50M-GON', fullName: 'Tomas Gonzalez', dni: '50333444', dob: new Date('2010-12-20'), phone: '', family: 'Gonzalez', nationality: 'Argentina', tierId: 'adult' },
    
    // Familia Perez
    { id: 'P-28M-PER', fullName: 'Roberto Perez', dni: '28444555', dob: new Date('1979-02-28'), phone: '341-234-5678', family: 'Perez', nationality: 'Argentina', tierId: 'adult', password: 'password' },
    { id: 'P-29F-PER', fullName: 'Lucia Gimenez', dni: '29555666', dob: new Date('1981-11-05'), phone: '341-234-5678', family: 'Perez', nationality: 'Argentina', tierId: 'adult' },

    // Familia Romero
    { id: 'P-17F-ROM', fullName: 'Susana Romero', dni: '17666777', dob: new Date('1965-01-12'), phone: '351-345-6789', family: 'Romero', nationality: 'Argentina', tierId: 'adult' },
    { id: 'P-18M-ROM', fullName: 'Ernesto Diaz', dni: '18777888', dob: new Date('1967-07-07'), phone: '351-345-6789', family: 'Romero', nationality: 'Argentina', tierId: 'adult' },
    
    // Grupo de Amigas
    { id: 'P-35F-GAR', fullName: 'Valentina Garcia', dni: '35888999', dob: new Date('1992-04-18'), phone: '11-4567-8901', family: 'Amigas-Mendoza', nationality: 'Argentina', tierId: 'adult' },
    { id: 'P-36F-FER', fullName: 'Julieta Fernandez', dni: '36999000', dob: new Date('1993-09-21'), phone: '11-4567-8902', family: 'Amigas-Mendoza', nationality: 'Argentina', tierId: 'adult' },
    { id: 'P-37F-LOP', fullName: 'Camila Lopez', dni: '37000111', dob: new Date('1994-03-03'), phone: '11-4567-8903', family: 'Amigas-Mendoza', nationality: 'Argentina', tierId: 'adult' },
    
    // Pasajeros individuales
    { id: 'P-25M-SAN', fullName: 'Jorge Sanchez', dni: '25111222', dob: new Date('1975-06-30'), phone: '221-567-8901', nationality: 'Argentina', tierId: 'adult' },
    { id: 'P-40F-TOR', fullName: 'Ana Torres', dni: '40222333', dob: new Date('2000-10-10'), phone: '342-678-9012', nationality: 'Argentina', tierId: 'adult' },

    // Pasajeros para el viaje pasado
    { id: 'P-26M-RAM', fullName: 'Esteban Ramirez', dni: '26333444', dob: new Date('1977-04-14'), phone: '343-789-0123', family: 'Ramirez', nationality: 'Argentina', tierId: 'adult' },
    { id: 'P-27F-RAM', fullName: 'Marta Sosa de Ramirez', dni: '27444555', dob: new Date('1978-05-15'), phone: '343-789-0123', family: 'Ramirez', nationality: 'Argentina', tierId: 'adult' }
];

export const mockReservations: Reservation[] = [
  // Reserva Familia Gonzalez para Salta
  { id: "R-001", tripId: "T-2024-SALTA", passenger: "Miguel Gonzalez", passengerIds: ["P-30M-GON", "P-32F-GON", "P-50M-GON"], paxCount: 3, assignedSeats: [{seatId: "1", unit: 1}, {seatId: "2", unit: 1}, {seatId: "3", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "EMP-01", finalPrice: 630000, boardingPointId: 'BP01', roomTypeId: "RT03" },
  
  // Reserva Familia Perez para Merlo
  { id: "R-002", tripId: "T-2024-MERLO", passenger: "Roberto Perez", passengerIds: ["P-28M-PER", "P-29F-PER"], paxCount: 2, assignedSeats: [{seatId: "5", unit: 1}, {seatId: "6", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Parcial", sellerId: "EMP-02", finalPrice: 370000, boardingPointId: 'BP02', roomTypeId: "RT01" },

  // Reserva Familia Romero para Salta
  { id: "R-003", tripId: "T-2024-SALTA", passenger: "Susana Romero", passengerIds: ["P-17F-ROM", "P-18M-ROM"], paxCount: 2, assignedSeats: [{seatId: "4", unit: 1}, {seatId: "5", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "SELL-EXT-01", finalPrice: 420000, boardingPointId: 'BP03' },
  
  // Reserva Grupo de Amigas para Mendoza
  { id: "R-004", tripId: "T-2025-MENDOZA", passenger: "Valentina Garcia", passengerIds: ["P-35F-GAR", "P-36F-FER", "P-37F-LOP"], paxCount: 3, assignedSeats: [{seatId: "10", unit: 1}, {seatId: "11", unit: 1}, {seatId: "12", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "EMP-03", finalPrice: 750000, roomTypeId: "RT03" },

  // Reserva individual para Merlo
  { id: "R-005", tripId: "T-2024-MERLO", passenger: "Jorge Sanchez", passengerIds: ["P-25M-SAN"], paxCount: 1, assignedSeats: [], assignedCabins: [], status: "Pendiente", paymentStatus: "Pendiente", sellerId: "unassigned", finalPrice: 185000 },
  
  // Reserva para el Crucero
  { id: "R-006", tripId: "T-2025-CRUCERO", passenger: "Ana Torres", passengerIds: ["P-40F-TOR"], paxCount: 1, assignedSeats: [], assignedCabins: [{cabinId: "C101", unit: 1}], status: "Confirmado", paymentStatus: "Pagado", sellerId: "EMP-ADMIN", finalPrice: 950000, roomTypeId: 'RT01', pensionId: 'pension-completa'},
  
  // Reserva para el viaje pasado
  { id: "R-007", tripId: "T-2024-PASADO", passenger: "Esteban Ramirez", passengerIds: ["P-26M-RAM", "P-27F-RAM"], paxCount: 2, assignedSeats: [{seatId: "15", unit: 1}, {seatId: "16", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "EMP-01", finalPrice: 180000, roomTypeId: "RT01" },
];


export const mockTickets: Ticket[] = []; // Se genera dinámicamente en el componente ahora

