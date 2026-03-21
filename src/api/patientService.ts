import api from "./axiosConfig";

export type PatientStatus = "Active" | "Inactive" | "Suspended";

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
  status: PatientStatus;
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

export interface UpdatePatientStatusRequest {
  status: PatientStatus;
}

export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListPatientsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PatientStatus;
  signal?: AbortSignal;
}

export const patientService = {
  async list(clinicId: string, params: ListPatientsParams = {}): Promise<PagedResponse<Patient>> {
    const { page = 1, pageSize = 10, search, status = "Active", signal } = params;
    const response = await api.get(`/clinicas/${clinicId}/pacientes`, {
      params: { page, pageSize, search: search || undefined, status },
      signal,
    });
    // fallback: backend retorna array simples
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        totalCount: response.data.length,
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

  async updateStatus(clinicId: string, patientId: string, data: UpdatePatientStatusRequest): Promise<Patient> {
    const response = await api.patch(`/clinicas/${clinicId}/pacientes/${patientId}/status`, data);
    return response.data;
  },

  async remove(clinicId: string, patientId: string): Promise<void> {
    await api.delete(`/clinicas/${clinicId}/pacientes/${patientId}`);
  },
};
