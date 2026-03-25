import api from "./axiosConfig";

export type AtendimentoStatus = "Scheduled" | "Completed" | "Cancelled";

export interface Atendimento {
  id: string;
  procedure: string;
  description: string | null;
  notes: string | null;
  scheduledAt: string;
  completedAt: string | null;
  status: AtendimentoStatus;
  price: number;
  professionalId: string | null;
  professionalName: string | null;
  tooth: string | null;
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
}

export const atendimentoService = {
  async list(clinicId: string): Promise<Atendimento[]> {
    const response = await api.get(`/clinicas/${clinicId}/atendimentos`);
    return response.data;
  },

  async create(clinicId: string, data: CreateAtendimentoRequest): Promise<Atendimento> {
    const response = await api.post(`/clinicas/${clinicId}/atendimentos`, data);
    return response.data;
  },

  async concluir(clinicId: string, atendimentoId: string): Promise<Atendimento> {
    const response = await api.post(
      `/clinicas/${clinicId}/atendimentos/${atendimentoId}/concluir`
    );
    return response.data;
  },
};
