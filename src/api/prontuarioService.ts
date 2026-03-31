import api from "./axiosConfig";

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

export const prontuarioService = {
  async list(clinicId: string, patientId: string): Promise<ProntuarioEntry[]> {
    const response = await api.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/prontuario`
    );
    return response.data;
  },

  async create(
    clinicId: string,
    patientId: string,
    data: CreateProntuarioRequest
  ): Promise<ProntuarioEntry> {
    const response = await api.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/prontuario`,
      data
    );
    return response.data;
  },
};
