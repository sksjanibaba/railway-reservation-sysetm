export interface User {
  id: string;
  email: string;
  name?: string;
}

export enum ClassType {
  SL = 'Sleeper (SL)',
  AC3 = 'AC 3 Tier (3A)',
  AC2 = 'AC 2 Tier (2A)',
  AC1 = 'AC First Class (1A)',
}

export interface SeatAvailability {
  type: ClassType;
  available: number;
  price: number;
  status: 'AVAILABLE' | 'WAITLIST' | 'RAC';
}

export interface Train {
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availability: SeatAvailability[];
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  berthPreference?: string;
  mobile: string;
  email: string;
}

export interface Ticket {
  pnr: string;
  train: Train;
  selectedClass: SeatAvailability;
  passengers: Passenger[];
  date: string;
  bookingStatus: 'CONFIRMED' | 'CANCELLED';
  bookingDate: string;
  totalAmount: number;
}

export type ViewState = 'AUTH' | 'SEARCH' | 'RESULTS' | 'BOOKING' | 'PAYMENT' | 'TICKET' | 'HISTORY';