export type DashboardPeriod = "today" | "week" | "month";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled";

export interface DashboardAppointment {
  id: string;
  dateTime: string;
  patientName: string;
  procedure: string;
  status: AppointmentStatus;
}

export interface BirthdayPatient {
  id: string;
  name: string;
  age?: number;
  whatsapp: string;
  birthDate: string;
}

export type LabDeliveryStatus = "in_transit" | "delivered";

export interface LabDelivery {
  id: string;
  patientName: string;
  pieceType: string;
  expectedDate: string;
  status: LabDeliveryStatus;
}

export type PendingAlertType = "unconfirmed" | "approval" | "critical";

export interface PendingAlert {
  id: string;
  title: string;
  description: string;
  type: PendingAlertType;
}

export interface OccupancyData {
  totalSlots: number;
  filledSlots: number;
  freeSlots: number;
  occupancyRate: number;
}
