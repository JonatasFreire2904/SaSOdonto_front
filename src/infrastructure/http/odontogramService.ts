/**
 * INFRASTRUCTURE — Odontogram HTTP Service
 */

import apiClient from "@/infrastructure/http/apiClient";
import type {
  Procedimento,
  ToothProcedureRequest,
  ToothProcedureResponse,
  UpdateToothStatusRequest,
} from "@/domain/types";

export const odontogramService = {
  async getProcedimentos(clinicId: string): Promise<Procedimento[]> {
    const response = await apiClient.get(`/clinicas/${clinicId}/procedimentos`);
    return response.data;
  },

  async addToothProcedure(
    clinicId: string,
    patientId: string,
    data: ToothProcedureRequest
  ): Promise<ToothProcedureResponse> {
    const response = await apiClient.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/odontograma/procedimentos`,
      data
    );
    return response.data;
  },

  async updateToothStatus(
    clinicId: string,
    patientId: string,
    toothNumber: number,
    data: UpdateToothStatusRequest
  ): Promise<void> {
    await apiClient.put(
      `/clinicas/${clinicId}/pacientes/${patientId}/odontograma/${toothNumber}`,
      data
    );
  },
};
