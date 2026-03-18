import { useQuery } from "@tanstack/react-query";
import { professionalService } from "@/api/professionalService";

export const professionalKeys = {
  all: (clinicId: string) => ["professionals", clinicId] as const,
};

export const useProfessionals = (clinicId: string) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: professionalKeys.all(clinicId),
    queryFn: () => professionalService.listByClinic(clinicId),
    enabled: !!clinicId,
  });

  return { data, isLoading, refetch };
};
