import { useMemo, useState } from "react";
import {
  birthdayPatientsMock,
  dashboardAppointmentsMock,
  labDeliveriesMock,
  pendingAlertsMock,
} from "../mockData";
import type { DashboardPeriod } from "../types";
import {
  calculateOccupancy,
  filterAppointmentsByPeriod,
  getDailyAppointmentsSeries,
  isBirthdayToday,
  isInPeriod,
} from "../utils";

export const useDashboardData = () => {
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const now = new Date();

  const appointments = useMemo(
    () => filterAppointmentsByPeriod(dashboardAppointmentsMock, period, now).sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    ),
    [period, now]
  );

  const birthdays = useMemo(
    () =>
      birthdayPatientsMock.filter((item) => isBirthdayToday(item.birthDate, now)),
    [now]
  );

  const labDeliveries = useMemo(
    () =>
      labDeliveriesMock.filter((item) =>
        isInPeriod(new Date(`${item.expectedDate}T00:00:00`), period, now)
      ),
    [period, now]
  );

  const occupancy = useMemo(() => calculateOccupancy(appointments, period), [appointments, period]);

  const chartSeries = useMemo(
    () => getDailyAppointmentsSeries(dashboardAppointmentsMock, period, now),
    [period, now]
  );

  return {
    period,
    setPeriod,
    now,
    appointments,
    birthdays,
    labDeliveries,
    pendingAlerts: pendingAlertsMock,
    occupancy,
    chartSeries,
  };
};
