import api from "./axiosConfig";

export interface Patient {
  id: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
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

export interface PaginatedPatients {
  data: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListPatientsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

export const patientService = {
  async list(clinicId: string, params: ListPatientsParams = {}): Promise<PaginatedPatients> {
    const { page = 1, pageSize = 10, search, signal } = params;
    const response = await api.get(`/clinicas/${clinicId}/pacientes`, {
      params: { page, pageSize, search: search || undefined },
      signal,
    });
    // suporte a backend que retorna array simples (sem paginação ainda)
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
        page,
        pageSize,
        totalPages: 1,
      };
    }
    return response.data;
  },

  async getById(clinicId: string, patientId: string): Promise<Patient> {
    const response = await api.get(`/clinicas/${clinicId}/pacientes/${patientId}`);
    return response.data;
  },

  async create(clinicId: string, data: CreatePatientRequest): Promise<Patient> {
    const response = await api.post(`/clinicas/${clinicId}/pacientes`, data);
    return response.data;
  },

  async update(clinicId: string, patientId: string, data: UpdatePatientRequest): Promise<Patient> {
    const response = await api.put(`/clinicas/${clinicId}/pacientes/${patientId}`, data);
    return response.data;
  },

  async remove(clinicId: string, patientId: string): Promise<void> {
    await api.delete(`/clinicas/${clinicId}/pacientes/${patientId}`);
  },
};
