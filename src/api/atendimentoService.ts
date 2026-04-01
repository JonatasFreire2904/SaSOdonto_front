/**
 * @deprecated Importe de @/infrastructure/http/appointmentService
 * Mantido para compatibilidade durante a migração
 *
 * REMOVIDO DESTE ARQUIVO:
 * - generateLocalAvailability() — lógica de negócio, responsabilidade do backend
 * - ALLOWED_DURATIONS — configuração da clínica, deve vir via API
 */
export { appointmentService as atendimentoService } from "@/infrastructure/http/appointmentService";
export type {
  AppointmentStatus as AtendimentoStatus,
  TimeSlot,
  AvailabilityResponse,
  DashboardFilters,
  DashboardSummary,
  DashboardAppointment,
  DashboardResponse,
  Appointment as Atendimento,
  CreateAppointmentRequest as CreateAtendimentoRequest,
} from "@/domain/types";
export type { AvailabilityFilters } from "@/infrastructure/http/appointmentService";
