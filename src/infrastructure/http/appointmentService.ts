/**
 * INFRASTRUCTURE — Appointment HTTP Service
 *
 * REGRAS REMOVIDAS DO FRONTEND (responsabilidade do backend):
 * - Geração de slots de disponibilidade (08:00-18:00, intervalos de 15min)
 * - Detecção de conflito de horário
 * - Lista de durações permitidas
 *
 * O endpoint GET /clinicas/{id}/agendamentos/disponibilidade deve retornar
 * os slots calculados pelo backend com base nas configurações reais da clínica.
 */

import apiClient from "@/infrastructure/http/apiClient";
import type {
  Appointment,
  CreateAppointmentRequest,
  AvailabilityResponse,
  DashboardFilters,
  DashboardResponse,
} from "@/domain/types";

export interface AvailabilityFilters {
  clinicId: string;
  date: string;
  professionalId: string;
}

export const appointmentService = {
  async getDashboard(filters?: DashboardFilters): Promise<DashboardResponse> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status !== undefined) params.append("status", String(filters.status));
    if (filters?.professionalId) params.append("professionalId", filters.professionalId);

    const queryString = params.toString();
    const url = `/dashboard/agendamentos${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  async create(clinicId: string, data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post(`/clinicas/${clinicId}/atendimentos`, data);
    return response.data;
  },

  async confirm(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.post(`/dashboard/agendamentos/${appointmentId}/confirmar`);
    return response.data;
  },

  async cancel(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.post(`/dashboard/agendamentos/${appointmentId}/cancelar`);
    return response.data;
  },

  async complete(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.post(`/dashboard/agendamentos/${appointmentId}/concluir`);
    return response.data;
  },

  /**
   * Busca slots de disponibilidade do backend.
   * O backend é responsável por calcular horários disponíveis
   * com base na agenda do profissional e nas configurações da clínica.
   */
  async getAvailability(filters: AvailabilityFilters): Promise<AvailabilityResponse> {
    const { clinicId, date, professionalId } = filters;
    const response = await apiClient.get(
      `/clinicas/${clinicId}/atendimentos/disponibilidade`,
      { params: { date, professionalId } }
    );
    return response.data;
  },
};
