/**
 * INFRASTRUCTURE — Prontuario HTTP Service
 */

import apiClient from "@/infrastructure/http/apiClient";
import type { ProntuarioEntry, CreateProntuarioRequest } from "@/domain/types";

export const prontuarioService = {
  async list(clinicId: string, patientId: string): Promise<ProntuarioEntry[]> {
    const response = await apiClient.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/prontuario`
    );
    return response.data;
  },

  async create(
    clinicId: string,
    patientId: string,
    data: CreateProntuarioRequest
  ): Promise<ProntuarioEntry> {
    const response = await apiClient.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/prontuario`,
      data
    );
    return response.data;
  },
};
