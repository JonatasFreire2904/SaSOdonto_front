import api from "./axiosConfig";

export type AtendimentoStatus = "Scheduled" | "InProgress" | "Completed" | "Cancelled";

// Availability types
export interface TimeSlot {
  time: string;        // HH:MM format
  available: boolean;
  appointmentId?: string;
}

export interface AvailabilityResponse {
  date: string;
  professionalId: string;
  professionalName?: string;
  slots: TimeSlot[];
}

export interface AvailabilityFilters {
  clinicId: string;
  date: string;          // YYYY-MM-DD
  professionalId: string;
}

export const ALLOWED_DURATIONS = [15, 30, 45, 60, 90, 120] as const;
export type AllowedDuration = (typeof ALLOWED_DURATIONS)[number];

export interface Atendimento {
  id: string;
  procedure: string;
  description?: string;
  notes?: string;
  scheduledAt: string;
  completedAt?: string;
  status: AtendimentoStatus;
  price: number;
  durationMinutes: number;
  professionalId?: string;
  professionalName?: string;
  tooth?: string;
  patientId: string;
  patientName: string;
  createdAt: string;
}

export interface CreateAtendimentoRequest {
  procedure: string;
  description?: string;
  notes?: string;
  scheduledAt: string;
  price?: number;
  professionalId: string;
  tooth?: string;
  patientId: string;
  treatmentItemId?: string;
  durationMinutes?: AllowedDuration;
}

// Dashboard types
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  status?: number;  // 0=Scheduled, 1=InProgress, 2=Completed, 3=Cancelled
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
  status: AtendimentoStatus;
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

export const atendimentoService = {
  // Endpoint legado com clinicId na URL
  async list(clinicId: string): Promise<Atendimento[]> {
    const response = await api.get(`/clinicas/${clinicId}/atendimentos`);
    return response.data;
  },

  // ✅ NOVO: Dashboard sem clinicId (usa JWT)
  async getDashboard(filters?: DashboardFilters): Promise<DashboardResponse> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status !== undefined) params.append("status", String(filters.status));
    if (filters?.professionalId) params.append("professionalId", filters.professionalId);

    const queryString = params.toString();
    const url = `/dashboard/agendamentos${queryString ? `?${queryString}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  // Endpoint legado com clinicId na URL (para criar)
  async create(clinicId: string, data: CreateAtendimentoRequest): Promise<Atendimento> {
    const response = await api.post(`/clinicas/${clinicId}/atendimentos`, data);
    return response.data;
  },

  // ✅ NOVO: Ações rápidas do dashboard (sem clinicId)
  async concluir(atendimentoId: string): Promise<Atendimento> {
    const response = await api.post(`/dashboard/agendamentos/${atendimentoId}/concluir`);
    return response.data;
  },

  async cancelar(atendimentoId: string): Promise<Atendimento> {
    const response = await api.post(`/dashboard/agendamentos/${atendimentoId}/cancelar`);
    return response.data;
  },

  async confirmar(atendimentoId: string): Promise<Atendimento> {
    const response = await api.post(`/dashboard/agendamentos/${atendimentoId}/confirmar`);
    return response.data;
  },

  /**
   * Busca disponibilidade de horários para uma data e profissional
   * 
   * Tenta usar endpoint do backend: GET /appointments/availability
   * Se não existir, gera slots localmente baseado em agendamentos do dashboard
   */
  async getAvailability(filters: AvailabilityFilters): Promise<AvailabilityResponse> {
    const { clinicId, date, professionalId } = filters;
    const response = await api.get(`/clinicas/${clinicId}/atendimentos/disponibilidade`, {
      params: { date, professionalId },
    });
    return response.data;
  },

  /**
   * Gera slots de disponibilidade localmente
   * Horário comercial: 08:00 - 18:00, intervalos de 30 minutos
   */
  generateLocalAvailability(
    date: string,
    professionalId: string,
    appointments: DashboardAppointment[]
  ): AvailabilityResponse {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    const intervalMinutes = 15;

    // Converte appointments em intervalos ocupados reais (inicio/fim) para detectar sobreposição.
    const occupiedRanges = appointments
      .filter((apt) => apt.status !== "Cancelled")
      .map((apt) => {
        const start = new Date(apt.scheduledAt);
        const duration = apt.durationMinutes && apt.durationMinutes > 0 ? apt.durationMinutes : 30;
        const end = new Date(start.getTime() + duration * 60 * 1000);
        return { start, end, appointmentId: apt.id };
      });

    // Verifica se é hoje e pega hora atual
    const now = new Date();
    const isToday = date === now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Gera slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        
        // Se é hoje, não permite horários passados
        const isPastTime = isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute));
        
        const slotStart = new Date(`${date}T${timeStr}:00`);
        const slotEnd = new Date(slotStart.getTime() + intervalMinutes * 60 * 1000);
        const occupiedRange = occupiedRanges.find(
          (range) => slotStart < range.end && slotEnd > range.start
        );
        const isOccupied = !!occupiedRange;
        
        slots.push({
          time: timeStr,
          available: !isOccupied && !isPastTime,
          appointmentId: occupiedRange?.appointmentId,
        });
      }
    }

    return { date, professionalId, slots };
  },
};
