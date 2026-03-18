import api from "./axiosConfig";

export interface Professional {
  id: string;
  userName: string;
  email: string;
  role: string;
  clinicId: string;
  createdAt: string;
}

export interface CreateProfessionalRequest {
  userName: string;
  email: string;
  password: string;
  role: string;
  clinicId: string;
}

export interface UpdateProfessionalRoleRequest {
  role: string;
}

export const professionalService = {
  async listByClinic(clinicId: string): Promise<Professional[]> {
    const response = await api.get(`/profissionais/clinic/${clinicId}`);
    return response.data;
  },

  async getById(id: string): Promise<Professional> {
    const response = await api.get(`/profissionais/${id}`);
    return response.data;
  },

  async create(data: CreateProfessionalRequest): Promise<Professional> {
    const response = await api.post(`/profissionais`, data);
    return response.data;
  },

  async updateRole(id: string, data: UpdateProfessionalRoleRequest): Promise<Professional> {
    const response = await api.put(`/profissionais/${id}/role`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/profissionais/${id}`);
  },
};
