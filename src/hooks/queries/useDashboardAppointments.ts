import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { atendimentoService } from "@/api/atendimentoService";
import type { DashboardFilters, DashboardResponse, DashboardAppointment } from "@/api/atendimentoService";

export type PeriodType = "today" | "week" | "custom";

const getDateRange = (period: PeriodType, customStart?: string, customEnd?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === "today") {
    const dateStr = today.toISOString().split("T")[0];
    return { startDate: dateStr, endDate: dateStr };
  }

  if (period === "week") {
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDate: monday.toISOString().split("T")[0],
      endDate: sunday.toISOString().split("T")[0],
    };
  }

  // custom
  return {
    startDate: customStart || today.toISOString().split("T")[0],
    endDate: customEnd || today.toISOString().split("T")[0],
  };
};

const statusValueMap: Record<string, number> = {
  Scheduled: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
};

export const dashboardKeys = (filters: DashboardFilters) => [
  "dashboard-appointments",
  filters,
];

/**
 * Hook para dashboard de agendamentos
 * Usa o endpoint /api/dashboard/agendamentos que obtém clinicId do JWT
 */
export const useDashboardAppointments = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodType>("today");
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [professionalFilter, setProfessionalFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filters = useMemo((): DashboardFilters => {
    const { startDate, endDate } = getDateRange(
      period,
      customDateRange?.start,
      customDateRange?.end
    );
    return {
      startDate,
      endDate,
      status: statusFilter ? statusValueMap[statusFilter] : undefined,
      professionalId: professionalFilter || undefined,
    };
  }, [period, customDateRange, statusFilter, professionalFilter]);

  const query = useQuery<DashboardResponse>({
    queryKey: dashboardKeys(filters),
    queryFn: () => atendimentoService.getDashboard(filters),
    staleTime: 1000 * 60, // 1 min
    refetchInterval: 1000 * 60 * 2, // refresh every 2 min
    retry: (failureCount, error) => {
      // Não retry se for erro de clínica não selecionada
      const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (code === "CLINIC_NOT_SELECTED") return false;
      return failureCount < 3;
    },
  });

  // Redireciona para seleção de clínica se necessário
  const errorCode = (query.error as { response?: { data?: { code?: string } } })?.response?.data?.code;
  if (errorCode === "CLINIC_NOT_SELECTED") {
    navigate("/clinicas");
  }

  // Filter by search term (client-side)
  const filteredAppointments = useMemo(() => {
    if (!query.data?.appointments) return [];
    if (!searchTerm.trim()) return query.data.appointments;
    const term = searchTerm.toLowerCase();
    return query.data.appointments.filter(
      (apt) =>
        apt.patientName.toLowerCase().includes(term) ||
        apt.procedure.toLowerCase().includes(term)
    );
  }, [query.data?.appointments, searchTerm]);

  // Group by period (morning/afternoon)
  const groupedAppointments = useMemo(() => {
    const morning: DashboardAppointment[] = [];
    const afternoon: DashboardAppointment[] = [];

    filteredAppointments.forEach((apt) => {
      const hour = new Date(apt.scheduledAt).getHours();
      if (hour < 12) {
        morning.push(apt);
      } else {
        afternoon.push(apt);
      }
    });

    // Sort by time
    const sortByTime = (a: DashboardAppointment, b: DashboardAppointment) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();

    return {
      morning: morning.sort(sortByTime),
      afternoon: afternoon.sort(sortByTime),
    };
  }, [filteredAppointments]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-appointments"] });
  }, [queryClient]);

  // Mutations for quick actions (sem clinicId - usa JWT)
  const confirmMutation = useMutation({
    mutationFn: (appointmentId: string) => atendimentoService.confirmar(appointmentId),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => atendimentoService.cancelar(appointmentId),
    onSuccess: invalidate,
  });

  const completeMutation = useMutation({
    mutationFn: (appointmentId: string) => atendimentoService.concluir(appointmentId),
    onSuccess: invalidate,
  });

  return {
    // Data
    data: query.data,
    appointments: filteredAppointments,
    groupedAppointments,
    summary: query.data?.summary,
    
    // State
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Filters
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    statusFilter,
    setStatusFilter,
    professionalFilter,
    setProfessionalFilter,
    searchTerm,
    setSearchTerm,
    
    // Actions
    confirm: confirmMutation.mutate,
    cancel: cancelMutation.mutate,
    complete: completeMutation.mutate,
    isConfirming: confirmMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isCompleting: completeMutation.isPending,
    refetch: query.refetch,
  };
};
