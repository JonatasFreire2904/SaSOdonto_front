import api from "./axiosConfig";
import type { PagedResponse as ApiPagedResponse } from "@/api.types";

export type PatientStatus = "Active" | "Inactive" | "Suspended";

export interface Patient {
  id: string;
  name: string;         // Alinhado com novo backend (era fullName)
  fullName?: string;    // Mantido para compatibilidade durante transição
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
  name: string;         // Alinhado com novo backend (era fullName)
  fullName?: string;    // Mantido para compatibilidade durante transição
  cpf?: string;
  birthDate: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdatePatientRequest {
  name?: string;        // Alinhado com novo backend (era fullName)
  fullName?: string;    // Mantido para compatibilidade durante transição
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

// Interface de resposta paginada do frontend (formato legado)
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

/**
 * Normaliza resposta do backend para formato interno do frontend
 */
function normalizePatient(p: Record<string, unknown>): Patient {
  return {
    ...p,
    // Suporta tanto 'name' (novo) quanto 'fullName' (legado)
    name: (p.name ?? p.fullName ?? "") as string,
    fullName: (p.fullName ?? p.name ?? "") as string,
  } as Patient;
}

export const patientService = {
  async list(clinicId: string, params: ListPatientsParams = {}): Promise<PagedResponse<Patient>> {
    const { page = 1, pageSize = 10, search, status = "Active", signal } = params;
    const response = await api.get(`/clinicas/${clinicId}/pacientes`, {
      params: { page, pageSize, search: search || undefined, status },
      signal,
    });
    
    // Backend retorna array simples (legado)
    if (Array.isArray(response.data)) {
      return {
        data: response.data.map(normalizePatient),
        totalCount: response.data.length,
        page,
        pageSize,
        totalPages: 1,
      };
    }
    
    // Backend retorna novo formato com 'items'
    const apiResponse = response.data as ApiPagedResponse<Patient>;
    if (apiResponse.items) {
      return {
        data: apiResponse.items.map(normalizePatient),
        totalCount: apiResponse.totalCount,
        page: apiResponse.page,
        pageSize: apiResponse.pageSize,
        totalPages: apiResponse.totalPages,
      };
    }
    
    // Backend retorna formato antigo com 'data'
    return {
      ...response.data,
      data: (response.data.data || []).map(normalizePatient),
    };
  },

  async getById(clinicId: string, patientId: string): Promise<Patient> {
    const response = await api.get(`/clinicas/${clinicId}/pacientes/${patientId}`);
    return normalizePatient(response.data);
  },

  async create(clinicId: string, data: CreatePatientRequest): Promise<Patient> {
    // Envia 'name' para novo backend (converte de fullName se necessário)
    const payload = {
      ...data,
      name: data.name ?? data.fullName,
    };
    const response = await api.post(`/clinicas/${clinicId}/pacientes`, payload);
    return normalizePatient(response.data);
  },

  async update(clinicId: string, patientId: string, data: UpdatePatientRequest): Promise<Patient> {
    // Envia 'name' para novo backend (converte de fullName se necessário)
    const payload = {
      ...data,
      name: data.name ?? data.fullName,
    };
    const response = await api.put(`/clinicas/${clinicId}/pacientes/${patientId}`, payload);
    return normalizePatient(response.data);
  },

  async updateStatus(clinicId: string, patientId: string, data: UpdatePatientStatusRequest): Promise<Patient> {
    const response = await api.patch(`/clinicas/${clinicId}/pacientes/${patientId}/status`, data);
    return normalizePatient(response.data);
  },

  async remove(clinicId: string, patientId: string): Promise<void> {
    await api.delete(`/clinicas/${clinicId}/pacientes/${patientId}`);
  },
};
