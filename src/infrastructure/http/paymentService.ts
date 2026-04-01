/**
 * INFRASTRUCTURE — Payment HTTP Service
 * Extraído de treatmentPlanService para seguir Single Responsibility.
 * Gerencia pagamentos de itens do plano de tratamento.
 *
 * NOTA: Cálculos financeiros (totais, saldos, descontos) são responsabilidade
 * do backend. O frontend apenas envia e exibe os dados recebidos.
 */

import apiClient from "@/infrastructure/http/apiClient";
import { extractPayload } from "@/infrastructure/adapters/responseAdapter";
import type {
  RegisterPaymentRequest,
  PaymentRecord,
  TreatmentPlanFinancialSummary,
} from "@/domain/types";

export const paymentService = {
  async register(
    clinicId: string,
    patientId: string,
    planId: string,
    itemId: string,
    data: RegisterPaymentRequest
  ): Promise<PaymentRecord> {
    const response = await apiClient.patch(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens/${itemId}/pagamento`,
      data
    );
    return extractPayload<PaymentRecord>(response.data);
  },

  async listByItem(
    clinicId: string,
    patientId: string,
    planId: string,
    itemId: string
  ): Promise<PaymentRecord[]> {
    const response = await apiClient.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/itens/${itemId}/pagamentos`
    );
    return extractPayload<PaymentRecord[]>(response.data) ?? [];
  },

  /**
   * Resumo financeiro calculado pelo backend.
   * O frontend NÃO calcula totais — apenas exibe o que o backend retorna.
   */
  async getFinancialSummary(
    clinicId: string,
    patientId: string,
    planId: string
  ): Promise<TreatmentPlanFinancialSummary> {
    const response = await apiClient.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/plano-tratamento/${planId}/financeiro`
    );
    return extractPayload<TreatmentPlanFinancialSummary>(response.data);
  },
};
