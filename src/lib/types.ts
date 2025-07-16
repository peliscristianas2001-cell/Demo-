export interface Tour {
  id: string;
  destination: string;
  date: Date;
  price: number;
  flyerUrl: string;
  totalSeats: number;
  occupiedSeats: string[];
}
