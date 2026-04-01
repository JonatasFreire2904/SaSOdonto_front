/**
 * INFRASTRUCTURE — Treatment Plan HTTP Service
 * Responsável apenas pelas operações de nível do plano (create, update, delete, list).
 * Itens do plano: planItemService.ts
 * Pagamentos: paymentService.ts
 */

import apiClient from "@/infrastructure/http/apiClient";
import { extractList } from "@/infrastructure/adapters/responseAdapter";
import type {
  TreatmentPlanItem,
  TreatmentPlanMeta,
  CreateTreatmentPlanRequest,
  UpdateTreatmentPlanRequest,
  PendingTreatmentItem,
} from "@/domain/types";

export const treatmentPlanService = {
  async list(clinicId: string, patientId: string): Promise<TreatmentPlanItem[]> {
    const response = await apiClient.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
    return response.data;
  },

  async create(
    clinicId: string,
    patientId: string,
    data: CreateTreatmentPlanRequest
  ): Promise<TreatmentPlanItem> {
    const response = await apiClient.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`,
      data
    );
    return response.data;
  },

  async update(
    clinicId: string,
    patientId: string,
    planId: string,
    data: UpdateTreatmentPlanRequest
  ): Promise<TreatmentPlanItem> {
    const response = await apiClient.put(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}`,
      data
    );
    return response.data;
  },

  async remove(clinicId: string, patientId: string, planId: string): Promise<void> {
    await apiClient.delete(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}`
    );
  },

  async removeAll(clinicId: string, patientId: string): Promise<void> {
    await apiClient.delete(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
  },

  /**
   * Cria um plano sem dados iniciais (corpo vazio — backend cria com defaults)
   */
  async createPlan(clinicId: string, patientId: string): Promise<TreatmentPlanMeta> {
    const response = await apiClient.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
    const raw = response.data;
    if (raw && typeof raw === "object" && "data" in raw) return raw.data as TreatmentPlanMeta;
    return raw as TreatmentPlanMeta;
  },

  async getPlan(clinicId: string, patientId: string): Promise<TreatmentPlanMeta> {
    const response = await apiClient.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
    const raw = response.data;
    if (raw && typeof raw === "object" && "data" in raw) return raw.data as TreatmentPlanMeta;
    return raw as TreatmentPlanMeta;
  },

  async listPendingTreatments(
    clinicId: string,
    patientId: string
  ): Promise<PendingTreatmentItem[]> {
    const response = await apiClient.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/tratamentos-pendentes`
    );
    return extractList<PendingTreatmentItem>(response.data);
  },
};
