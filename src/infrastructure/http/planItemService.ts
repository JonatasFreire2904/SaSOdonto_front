/**
 * INFRASTRUCTURE — Plan Item HTTP Service
 * Extraído de treatmentPlanService para seguir Single Responsibility.
 * Gerencia apenas os itens dentro de um plano de tratamento.
 */

import apiClient from "@/infrastructure/http/apiClient";
import { extractPayload } from "@/infrastructure/adapters/responseAdapter";
import type {
  PlanItem,
  CreatePlanItemRequest,
  CompletePlanItemRequest,
} from "@/domain/types";

export const planItemService = {
  async list(clinicId: string, patientId: string, planId: string): Promise<PlanItem[]> {
    const response = await apiClient.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens`
    );
    return extractPayload<PlanItem[]>(response.data);
  },

  async create(
    clinicId: string,
    patientId: string,
    planId: string,
    data: CreatePlanItemRequest
  ): Promise<PlanItem> {
    const response = await apiClient.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens`,
      data
    );
    return response.data;
  },

  async complete(
    clinicId: string,
    patientId: string,
    planId: string,
    itemId: string,
    data: CompletePlanItemRequest
  ): Promise<void> {
    await apiClient.patch(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens/${itemId}/concluir`,
      data
    );
  },

  async cancel(
    clinicId: string,
    patientId: string,
    planId: string,
    itemId: string
  ): Promise<void> {
    await apiClient.patch(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens/${itemId}/cancelar`
    );
  },

  async remove(
    clinicId: string,
    patientId: string,
    planId: string,
    itemId: string
  ): Promise<void> {
    await apiClient.delete(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens/${itemId}`
    );
  },
};
