import api from "./axiosConfig";

export interface PlanItem {
  id: string;
  toothNumber: number;
  procedureName: string;
  status: "planned" | "inProgress" | "completed" | "cancelled";
  notes: string | null;
  completionComment: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreatePlanItemRequest {
  toothNumber: number;
  procedureName: string;
  notes?: string | null;
}

export interface TreatmentPlanMeta {
  id: string;
  [key: string]: unknown;
}

export interface TreatmentPlanItem {
  id: string;
  name: string;
  category: string | null;
  date: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTreatmentPlanRequest {
  name: string;
  category?: string;
  date: string;
}

export interface UpdateTreatmentPlanRequest {
  name?: string;
  category?: string;
  date?: string;
  isCompleted?: boolean;
}

export const treatmentPlanService = {
  async list(clinicId: string, patientId: string): Promise<TreatmentPlanItem[]> {
    const response = await api.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
    return response.data;
  },

  async create(
    clinicId: string,
    patientId: string,
    data: CreateTreatmentPlanRequest
  ): Promise<TreatmentPlanItem> {
    const response = await api.post(
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
    const response = await api.put(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}`,
      data
    );
    return response.data;
  },

  async remove(
    clinicId: string,
    patientId: string,
    planId: string
  ): Promise<void> {
    await api.delete(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}`
    );
  },

  async removeAll(clinicId: string, patientId: string): Promise<void> {
    await api.delete(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
  },

  async getPlan(clinicId: string, patientId: string): Promise<TreatmentPlanMeta> {
    const response = await api.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
    return response.data;
  },

  async createPlan(clinicId: string, patientId: string): Promise<TreatmentPlanMeta> {
    const response = await api.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
    return response.data;
  },

  async listItems(clinicId: string, patientId: string, planId: string): Promise<PlanItem[]> {
    const response = await api.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens`
    );
    return response.data.data;
  },

  async createItem(
    clinicId: string,
    patientId: string,
    planId: string,
    data: CreatePlanItemRequest
  ): Promise<PlanItem> {
    const response = await api.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens`,
      data
    );
    return response.data;
  },

  async completeItem(
    clinicId: string,
    patientId: string,
    planId: string,
    itemId: string
  ): Promise<void> {
    await api.patch(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens/${itemId}/concluir`,
      { completionComment: null }
    );
  },

  async cancelItem(
    clinicId: string,
    patientId: string,
    planId: string,
    itemId: string
  ): Promise<void> {
    await api.patch(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens/${itemId}/cancelar`
    );
  },
};
