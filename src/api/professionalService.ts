import api from "./axiosConfig";

// PascalCase conforme backend
export type ProfessionalRole = "Dentista" | "Rh" | "Auxiliar" | "Gestor";

export interface Professional {
  id: string;
  userName: string;
  email: string;
  role: string;
  clinicId: string | null;
  createdAt: string;
}

export interface CreateProfessionalRequest {
  userName: string;
  email: string;
  password: string;
  role: ProfessionalRole;
  clinicId?: string;
}

export interface UpdateProfessionalRequest {
  userName: string;
  email: string;
  password?: string;
}

export interface UpdateProfessionalRoleRequest {
  role: ProfessionalRole;
}

export const professionalService = {
  // GET /api/profissionais/clinic/{clinicId}
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

  async update(id: string, data: UpdateProfessionalRequest): Promise<Professional> {
    const response = await api.put(`/profissionais/${id}`, data);
    return response.data;
  },

  // DELETE /api/profissionais/{id}?clinicId={id}
  async remove(id: string, clinicId: string): Promise<void> {
    await api.delete(`/profissionais/${id}`, { params: { clinicId } });
  },
};
