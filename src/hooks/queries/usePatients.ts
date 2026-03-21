import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { patientService, type PatientStatus } from "@/api/patientService";

export const patientKeys = {
  all: (clinicId: string) => ["patients", clinicId] as const,
  list: (clinicId: string, page: number, pageSize: number, search: string, status: PatientStatus) =>
    ["patients", clinicId, page, pageSize, search, status] as const,
  detail: (clinicId: string, patientId: string) => ["patients", clinicId, patientId] as const,
};

export const usePatients = (
  clinicId: string,
  search: string,
  page: number,
  pageSize = 10,
  status: PatientStatus = "Active"
) => {
  const abortRef = useRef<AbortController | null>(null);

  return useQuery({
    queryKey: patientKeys.list(clinicId, page, pageSize, search, status),
    queryFn: () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      return patientService.list(clinicId, {
        page,
        pageSize,
        search: search || undefined,
        status,
        signal: abortRef.current.signal,
      });
    },
    enabled: !!clinicId,
    placeholderData: (prev) => prev,
  });
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
