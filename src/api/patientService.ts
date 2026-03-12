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

export const patientService = {
  async list(clinicId: string, search?: string): Promise<Patient[]> {
    const params = search ? { q: search } : {};
    const response = await api.get(`/clinicas/${clinicId}/pacientes`, { params });
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
