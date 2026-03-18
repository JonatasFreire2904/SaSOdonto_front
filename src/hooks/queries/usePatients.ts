import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { patientService } from "@/api/patientService";

export const patientKeys = {
  all: (clinicId: string) => ["patients", clinicId] as const,
  list: (clinicId: string, page: number, pageSize: number, search: string) =>
    ["patients", clinicId, page, pageSize, search] as const,
  detail: (clinicId: string, patientId: string) => ["patients", clinicId, patientId] as const,
};

export const usePatients = (clinicId: string, search: string, page: number, pageSize = 10) => {
  const abortRef = useRef<AbortController | null>(null);

  const query = useQuery({
    queryKey: patientKeys.list(clinicId, page, pageSize, search),
    queryFn: () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      return patientService.list(clinicId, {
        page,
        pageSize,
        search: search || undefined,
        signal: abortRef.current.signal,
      });
    },
    enabled: !!clinicId,
    placeholderData: (prev) => prev, // keeps previous data while fetching next page
  });

  return query;
};

export const useDebounce = (value: string, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export const usePatientDetail = (clinicId: string, patientId: string) => {
  return useQuery({
    queryKey: patientKeys.detail(clinicId, patientId),
    queryFn: () => patientService.getById(clinicId, patientId),
    enabled: !!clinicId && !!patientId,
  });
};
