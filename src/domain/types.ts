/**
 * DOMAIN LAYER — Tipos e interfaces do domínio da aplicação
 * Independentes de framework, HTTP ou storage
 */

// ==================== ERRO ====================

export interface ApiError {
  message: string;
}

// ==================== PAGINAÇÃO ====================

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ==================== STATUS ====================

export type PatientStatus = "Active" | "Inactive" | "Suspended";

export type AppointmentStatus = "Scheduled" | "InProgress" | "Completed" | "Cancelled";

export type PlanItemStatus =
  | "Planned"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "planned"
  | "inProgress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "Unpaid" | "PartiallyPaid" | "Paid";

export type ProfessionalRole = "Dentista" | "Auxiliar" | "Rh" | "Gestor";

// ==================== CLÍNICA ====================

export interface Clinic {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  status: "active" | "inactive";
  teamCount: number;
}

export interface SelectClinicResponse {
  token: string;
  id: string;
  name: string;
  location: string;
}

// ==================== PACIENTE ====================

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: PatientStatus;
  clinicId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  fullName: string;
  cpf?: string;
  birthDate: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdatePatientRequest {
  fullName?: string;
  cpf?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface ListPatientsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PatientStatus;
  signal?: AbortSignal;
}

// ==================== PROFISSIONAL ====================

export interface Professional {
  id: string;
  userName: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: string;
  clinicId: string | null;
  createdAt: string;
}

export interface CreateProfessionalRequest {
  userName: string;
  email: string;
  password: string;
  role: ProfessionalRole;
  cpf?: string;
  phone?: string;
  clinicId?: string;
}

export interface UpdateProfessionalRequest {
  userName: string;
  email: string;
  cpf?: string;
  phone?: string;
  password?: string;
  role?: ProfessionalRole;
  isActive?: boolean;
}

export interface UpdateProfessionalRoleRequest {
  role: ProfessionalRole;
}

// ==================== AGENDAMENTO ====================

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface AvailabilityResponse {
  date: string;
  professionalId: string;
  professionalName?: string;
  slots: TimeSlot[];
}

export interface Appointment {
  id: string;
  procedure: string;
  description?: string;
  notes?: string;
  scheduledAt: string;
  completedAt?: string;
  status: AppointmentStatus;
  price: number;
  durationMinutes: number;
  professionalId?: string;
  professionalName?: string;
  tooth?: string;
  patientId: string;
  patientName: string;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  procedure: string;
  description?: string;
  notes?: string;
  scheduledAt: string;
  price?: number;
  professionalId: string;
  tooth?: string;
  patientId: string;
  treatmentItemId?: string;
  durationMinutes?: number;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  status?: number;
  professionalId?: string;
}

export interface DashboardSummary {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface DashboardAppointment {
  id: string;
  procedure: string;
  scheduledAt: string;
  status: AppointmentStatus;
  durationMinutes: number;
  patientId: string;
  patientName: string;
  professionalName?: string;
  tooth?: string;
}

export interface DashboardResponse {
  referenceDate: string;
  period: string;
  summary: DashboardSummary;
  appointments: DashboardAppointment[];
}

// ==================== PLANO DE TRATAMENTO ====================

export interface TreatmentPlanMeta {
  id: string;
  [key: string]: unknown;
}

export interface TreatmentPlanItem {
  id: string;
  name: string;
  category: string | null;
  date: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTreatmentPlanRequest {
  name: string;
  category?: string;
  date: string;
}

export interface UpdateTreatmentPlanRequest {
  name?: string;
  category?: string;
  date?: string;
  isCompleted?: boolean;
}

// ==================== ITEM DO PLANO ====================

export interface PlanItem {
  id: string;
  toothNumber: number;
  procedureName: string;
  price?: number | null;
  paidAmount?: number | null;
  balanceAmount?: number | null;
  paymentStatus?: PaymentStatus;
  status: PlanItemStatus;
  notes?: string;
  completionComment?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreatePlanItemRequest {
  toothNumber?: number | null;
  procedureName: string;
  price?: number | null;
  notes?: string | null;
}

export interface CompletePlanItemRequest {
  completionComment?: string | null;
  completedAt: string;
}

export interface PendingTreatmentItem {
  id: string;
  toothNumber?: number;
  procedureName: string;
  price?: number | null;
  paidAmount?: number | null;
  status: "Planned" | "InProgress" | string;
  notes?: string | null;
  createdAt?: string;
  treatmentPlan?: {
    id: string;
    name: string;
    createdAt?: string;
  };
}

// ==================== PAGAMENTO ====================

export enum PaymentMethod {
  Pix = 0,
  Cash = 1,
  CreditCard = 2,
  DebitCard = 3,
}

export interface RegisterPaymentRequest {
  amount: number;
  method: PaymentMethod;
  installments?: number;
  discountPercent?: number;
  discountAmount?: number;
  machineFeePercent?: number;
  machineFeeAmount?: number;
  netAmount?: number;
  paidAt?: string;
  note?: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  installments?: number;
  discountPercent?: number;
  discountAmount?: number;
  machineFeePercent?: number;
  machineFeeAmount?: number;
  netAmount?: number;
  paidAt: string;
  note?: string;
}

export interface TreatmentPlanFinancialSummary {
  totalTreatment: number;
  totalCompleted: number;
  totalPaid: number;
  remainingBalance: number;
}

// ==================== PRONTUÁRIO ====================

export interface ProntuarioEntry {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface CreateProntuarioRequest {
  type: string;
  title: string;
  description?: string;
}

// ==================== ODONTOGRAMA ====================

export interface Procedimento {
  id: string;
  name: string;
  category?: string;
}

export interface ToothProcedureRequest {
  toothNumber: number;
  procedureId: string;
  faces: string;
  notes?: string;
}

export interface ToothProcedureResponse {
  id: string;
  toothNumber: number;
  procedureId: string;
  procedureName: string;
  faces: string;
  notes: string | null;
  createdAt: string;
}

export interface UpdateToothStatusRequest {
  status: string;
  notes?: string;
}

// ==================== MÍDIA ====================

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "pdf" | "document";
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

// ==================== AUTH ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  userName: string;
}
