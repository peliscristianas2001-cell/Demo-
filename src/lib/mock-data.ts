
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
    { id: 'BP01', name: 'Terminal A' },
    { id: 'BP02', name: 'Cruce Principal' },
    { id: 'BP03', name: 'Plaza Central' },
];

export const mockCommissionSettings: CommissionSettings = {
    rules: [
        { id: 'C01', from: 1, to: 4, rate: 5 },
        { id: 'C02', from: 5, to: 'infinite', rate: 10 }
    ]
}


export const mockTours: Tour[] = [
  {
    id: 'T-2026-DESTINO1',
    destination: 'Destino de Playa',
    date: new Date('2026-07-10T20:00:00'),
    price: 350000,
    flyers: [
        { id: 'FLY-BAR-1', url: 'https://placehold.co/400x500/0284C7/FFFFFF.png', type: 'image' },
    ],
    origin: "Ciudad Principal",
    nights: 7,
    bus: "Transportes Demo",
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'micro_largo', count: 1, coordinator: "Coordinador 1", coordinatorPhone: "341-555-0101" },
    ],
  },
  {
    id: 'T-2026-DESTINO2',
    destination: 'Aventura en la Montaña',
    date: new Date('2026-09-05T18:30:00'),
    price: 280000,
     flyers: [
        { id: 'FLY-CAT-1', url: 'https://placehold.co/400x500/16A34A/FFFFFF.png', type: 'image' },
    ],
    origin: "Ciudad Secundaria",
    nights: 5,
    bus: "Transportes Demo",
    transportUnits: [
        { id: 1, category: 'vehicles', type: 'micro_largo', count: 1, coordinator: "Coordinador 2", coordinatorPhone: "11-2233-4455" },
    ],
  },
];

export const mockEmployees: Employee[] = [
    { id: 'EMP-01', name: 'Empleado de Prueba 1', dni: '11111111', phone: '1122334455', password: "password123", fixedSalary: 180000 },
    { id: 'EMP-02', name: 'Empleado de Prueba 2', dni: '22222222', phone: '1166778899', password: "password123", fixedSalary: 180000 },
    { id: 'EMP-ADMIN', name: 'Admin Demo', dni: '99999999', phone: '1111111111' }
];

export const mockSellers: Seller[] = [
    { id: 'SELL-EXT-01', name: 'Vendedor Externo 1', dni: '33333333', phone: '342-555-0101', useFixedCommission: false },
    { id: 'SELL-EXT-02', name: 'Vendedor Externo 2', dni: '44444444', phone: '261-555-0202', useFixedCommission: true, fixedCommissionRate: 12 },
];


export const mockPassengers: Passenger[] = [
    { id: 'P-30M-PER', fullName: 'Juan Perez', dni: '30123456', dob: new Date('1983-04-12'), phone: '11-3030-4040', family: 'Perez', nationality: 'Argentina', tierId: 'adult' },
    { id: 'P-32F-PER', fullName: 'Maria Lopez de Perez', dni: '32456789', dob: new Date('1986-07-25'), phone: '11-3030-4040', family: 'Perez', nationality: 'Argentina', tierId: 'adult', email: 'maria.perez@example.com' },
    { id: 'P-28M-GAR', fullName: 'Carlos Garcia', dni: '28987654', dob: new Date('1980-01-15'), phone: '341-505-6060', family: 'Garcia', nationality: 'Argentina', tierId: 'adult', email: 'carlos.garcia@example.com' },
];

export const mockReservations: Reservation[] = [
  { id: "R-26-001", tripId: "T-2026-DESTINO1", passenger: "Juan Perez", passengerIds: ["P-30M-PER", "P-32F-PER"], paxCount: 2, assignedSeats: [{seatId: "1", unit: 1}, {seatId: "2", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Pagado", sellerId: "EMP-01", finalPrice: 700000, boardingPointId: 'BP01', roomTypeId: "RT01" },
  { id: "R-26-002", tripId: "T-2026-DESTINO2", passenger: "Carlos Garcia", passengerIds: ["P-28M-GAR"], paxCount: 1, assignedSeats: [{seatId: "5", unit: 1}], assignedCabins: [], status: "Confirmado", paymentStatus: "Parcial", sellerId: "EMP-02", finalPrice: 280000, boardingPointId: 'BP02', roomTypeId: "RT01" },
];

export const mockTickets: Ticket[] = [];
