/**
 * INFRASTRUCTURE — Professional HTTP Service
 */

import apiClient from "@/infrastructure/http/apiClient";
import type {
  Professional,
  CreateProfessionalRequest,
  UpdateProfessionalRequest,
  UpdateProfessionalRoleRequest,
} from "@/domain/types";

export const professionalService = {
  async listByClinic(clinicId: string): Promise<Professional[]> {
    const response = await apiClient.get(`/profissionais/clinic/${clinicId}`);
    return response.data;
  },

  async getById(id: string): Promise<Professional> {
    const response = await apiClient.get(`/profissionais/${id}`);
    return response.data;
  },

  async create(data: CreateProfessionalRequest): Promise<Professional> {
    const response = await apiClient.post("/profissionais", data);
    return response.data;
  },

  async updateRole(id: string, data: UpdateProfessionalRoleRequest): Promise<Professional> {
    const response = await apiClient.put(`/profissionais/${id}/role`, data);
    return response.data;
  },

  async update(id: string, data: UpdateProfessionalRequest): Promise<Professional> {
    const response = await apiClient.put(`/profissionais/${id}`, data);
    return response.data;
  },

  async remove(id: string, clinicId: string): Promise<void> {
    await apiClient.delete(`/profissionais/${id}`, { params: { clinicId } });
  },
};
