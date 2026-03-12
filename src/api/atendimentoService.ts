import api from "./axiosConfig";

export interface Atendimento {
  id: string;
  procedure: string;
  description: string | null;
  notes: string | null;
  scheduledAt: string;
  completedAt: string | null;
  status: "scheduled" | "completed" | "cancelled";
  price: number;
  dentistName: string | null;
  tooth: string | null;
  patientId: string;
  patientName: string;
  createdAt: string;
}

export interface CreateAtendimentoRequest {
  procedure: string;
  description?: string;
  scheduledAt: string;
  price?: number;
  dentistName?: string;
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
    const response = await api.put(
      `/clinicas/${clinicId}/atendimentos/${atendimentoId}/concluir`
    );
    return response.data;
  },
};
