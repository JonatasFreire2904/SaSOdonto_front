import { useQuery } from "@tanstack/react-query";
import { mediaService } from "@/api/mediaService";

export const mediaKeys = (clinicId: string, patientId: string) => [
  "medias",
  clinicId,
  patientId,
];

export const useMedias = (clinicId: string, patientId: string) => {
  return useQuery({
    queryKey: mediaKeys(clinicId, patientId),
    queryFn: () => mediaService.list(clinicId, patientId),
    enabled: !!clinicId && !!patientId,
  });
};
