/**
 * INFRASTRUCTURE — Clinic HTTP Service
 * Responsável por todas as chamadas HTTP relacionadas a clínicas.
 * Inclui a troca de token multi-tenant que foi extraída de ClinicSelection.tsx.
 */

import apiClient from "@/infrastructure/http/apiClient";
import { authStorage } from "@/infrastructure/storage/authStorage";
import { clinicStorage } from "@/infrastructure/storage/clinicStorage";
import type { Clinic, SelectClinicResponse } from "@/domain/types";

export interface CreateClinicRequest {
  name: string;
  location: string;
  imageUrl?: string;
}

export const clinicService = {
  async list(): Promise<Clinic[]> {
    const response = await apiClient.get("/clinicas");
    return response.data;
  },

  /**
   * Seleciona uma clínica, substituindo o JWT atual pelo token com clinic_id no claim.
   * A lógica de troca de token pertence à infraestrutura, não à UI.
   */
  async select(clinicId: string): Promise<void> {
    const response = await apiClient.post<SelectClinicResponse>(
      `/clinicas/${clinicId}/selecionar`
    );

    if (response.data.token) {
      authStorage.setToken(response.data.token);
    }

    clinicStorage.setClinic({
      id: response.data.id,
      name: response.data.name,
      location: response.data.location,
    });
  },

  async create(data: CreateClinicRequest): Promise<Clinic> {
    const response = await apiClient.post("/clinicas", data);
    return response.data;
  },
};
