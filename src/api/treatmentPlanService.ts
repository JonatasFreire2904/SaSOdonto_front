import api from "./axiosConfig";

export interface PlanItem {
  id: string;
  toothNumber: number;
  procedureName: string;
  status: "planned" | "inProgress" | "completed" | "cancelled";
  notes?: string;
  completionComment?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreatePlanItemRequest {
  toothNumber?: number | null;  // Opcional para procedimentos gerais
  procedureName: string;
  notes?: string | null;
}

export interface CompletePlanItemRequest {
  completionComment?: string | null;
  completedAt: string;
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

/**
 * Resposta do endpoint de tratamentos pendentes
 * GET /api/clinicas/{clinicId}/pacientes/{patientId}/tratamentos-pendentes
 */
export interface PendingTreatmentItem {
  id: string;
  toothNumber?: number;           // 0 = procedimento geral, pode ser undefined
  procedureName: string;
  status: "Planned" | "InProgress" | string;
  notes?: string | null;
  createdAt?: string;
  treatmentPlan?: {
    id: string;
    name: string;
    createdAt?: string;
  };
}

/**
 * Helper para formatar número do dente
 */
export const formatToothNumber = (toothNumber: number): string => {
  return toothNumber === 0 ? "Geral" : `Dente ${toothNumber}`;
};

const extractPayload = <T>(raw: unknown): T => {
  if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
    return (raw as { data: T }).data;
  }

  return raw as T;
};

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
    return extractPayload<TreatmentPlanMeta>(response.data);
  },

  async createPlan(clinicId: string, patientId: string): Promise<TreatmentPlanMeta> {
    const response = await api.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento`
    );
    return extractPayload<TreatmentPlanMeta>(response.data);
  },

  async listItems(clinicId: string, patientId: string, planId: string): Promise<PlanItem[]> {
    const response = await api.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens`
    );
    return extractPayload<PlanItem[]>(response.data);
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
    itemId: string,
    data: CompletePlanItemRequest
  ): Promise<void> {
    await api.patch(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens/${itemId}/concluir`,
      data
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

  /**
   * Lista tratamentos pendentes do paciente (Planned e InProgress)
   * GET /api/clinicas/{clinicId}/pacientes/{patientId}/tratamentos-pendentes
   */
  async listPendingTreatments(
    clinicId: string,
    patientId: string
  ): Promise<PendingTreatmentItem[]> {
    const response = await api.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/tratamentos-pendentes`
    );
    // Normaliza resposta - pode vir como array direto ou { items: [], data: [] }
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === "object") {
      return data.items ?? data.data ?? [];
    }
    return [];
  },
};
