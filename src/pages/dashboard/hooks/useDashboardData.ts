import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { atendimentoService } from "@/api/atendimentoService";
import type { DashboardPeriod } from "../types";
import type { DashboardAppointment } from "../types";
import {
  calculateOccupancy,
  getDailyAppointmentsSeries,
} from "../utils";

const getDateRange = (period: DashboardPeriod) => {
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

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    startDate: firstDay.toISOString().split("T")[0],
    endDate: lastDay.toISOString().split("T")[0],
  };
};

const mapApiStatus = (
  status: string
): DashboardAppointment["status"] => {
  if (status === "Cancelled") return "cancelled";
  if (status === "Scheduled") return "pending";
  return "confirmed";
};

export const useDashboardData = () => {
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const now = new Date();

  const { startDate, endDate } = getDateRange(period);

  const query = useQuery({
    queryKey: ["dashboard-data", period],
    queryFn: () => atendimentoService.getDashboard({ startDate, endDate }),
    staleTime: 1000 * 60,
  });

  const appointments = useMemo((): DashboardAppointment[] => {
    if (!query.data?.appointments) return [];
    return query.data.appointments.map((apt) => ({
      id: apt.id,
      dateTime: apt.scheduledAt,
      patientName: apt.patientName,
      procedure: apt.procedure,
      status: mapApiStatus(apt.status),
    }));
  }, [query.data?.appointments]);

  const occupancy = useMemo(
    () => calculateOccupancy(appointments, period),
    [appointments, period]
  );

  const chartSeries = useMemo(
    () => getDailyAppointmentsSeries(appointments, period, now),
    [appointments, period, now]
  );

  return {
    period,
    setPeriod,
    now,
    appointments,
    birthdays: [],
    labDeliveries: [],
    pendingAlerts: [],
    occupancy,
    chartSeries,
    isLoading: query.isLoading,
  };
};
