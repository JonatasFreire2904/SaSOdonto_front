import { useQuery } from "@tanstack/react-query";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import type { TreatmentPlanMeta } from "@/api/treatmentPlanService";
import { AxiosError } from "axios";

export const planKeys = (clinicId: string, patientId: string) => [
  "treatmentPlanMeta",
  clinicId,
  patientId,
];

export const usePlan = (clinicId: string, patientId: string) => {
  return useQuery<TreatmentPlanMeta | null>({
    queryKey: planKeys(clinicId, patientId),
    queryFn: async () => {
      try {
        return await treatmentPlanService.getPlan(clinicId, patientId);
      } catch (err) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!clinicId && !!patientId,
  });
};
