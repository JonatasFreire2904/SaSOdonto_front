/**
 * @deprecated Importe de @/infrastructure/http/treatmentPlanService,
 *             @/infrastructure/http/planItemService,
 *             @/infrastructure/http/paymentService
 * Mantido para compatibilidade durante a migração
 */
export { treatmentPlanService } from "@/infrastructure/http/treatmentPlanService";
export { planItemService } from "@/infrastructure/http/planItemService";
export { paymentService } from "@/infrastructure/http/paymentService";

export type {
  TreatmentPlanItem,
  TreatmentPlanMeta,
  CreateTreatmentPlanRequest,
  UpdateTreatmentPlanRequest,
  PlanItem,
  CreatePlanItemRequest,
  CompletePlanItemRequest,
  PendingTreatmentItem,
  RegisterPaymentRequest,
  PaymentRecord as PaymentResponse,
  TreatmentPlanFinancialSummary,
} from "@/domain/types";

export { PaymentMethod } from "@/domain/types";

export const formatToothNumber = (toothNumber: number): string =>
  toothNumber === 0 ? "Geral" : `Dente ${toothNumber}`;
