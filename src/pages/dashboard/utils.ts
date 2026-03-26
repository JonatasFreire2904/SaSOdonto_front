import type {
  AppointmentStatus,
  DashboardAppointment,
  DashboardPeriod,
  OccupancyData,
} from "./types";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (date: Date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const isInPeriod = (value: Date, period: DashboardPeriod, now: Date) => {
  if (period === "today") {
    return isSameDay(value, now);
  }

  if (period === "week") {
    const start = getStartOfWeek(now);
    const end = getEndOfWeek(now);
    return value >= start && value <= end;
  }

  return (
    value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth()
  );
};

export const filterAppointmentsByPeriod = (
  appointments: DashboardAppointment[],
  period: DashboardPeriod,
  now: Date
) => {
  return appointments.filter((appointment) =>
    isInPeriod(new Date(appointment.dateTime), period, now)
  );
};

export const getStatusLabel = (status: AppointmentStatus) => {
  const map: Record<AppointmentStatus, string> = {
    confirmed: "Confirmado",
    pending: "Pendente",
    cancelled: "Cancelado",
  };

  return map[status];
};

export const getAppointmentTimingType = (appointment: DashboardAppointment, now: Date) => {
  const dateTime = new Date(appointment.dateTime);
  const diffMs = dateTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 0 && appointment.status !== "cancelled") {
    return "overdue";
  }

  if (diffMinutes >= 0 && diffMinutes <= 30 && appointment.status !== "cancelled") {
    return "upcoming";
  }

  return "regular";
};

export const calculateOccupancy = (
  appointments: DashboardAppointment[],
  period: DashboardPeriod
): OccupancyData => {
  const totalSlotsByPeriod: Record<DashboardPeriod, number> = {
    today: 12,
    week: 60,
    month: 240,
  };

  const totalSlots = totalSlotsByPeriod[period];
  const filledSlots = appointments.filter((item) => item.status !== "cancelled").length;
  const freeSlots = Math.max(totalSlots - filledSlots, 0);
  const occupancyRate = totalSlots === 0 ? 0 : Math.round((filledSlots / totalSlots) * 100);

  return {
    totalSlots,
    filledSlots,
    freeSlots,
    occupancyRate,
  };
};

export const getOccupancyTone = (rate: number) => {
  if (rate > 80) {
    return "high";
  }

  if (rate >= 50) {
    return "medium";
  }

  return "low";
};

export const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isBirthdayToday = (birthDate: string, now: Date) => {
  const date = new Date(`${birthDate}T00:00:00`);
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
};

export const getDailyAppointmentsSeries = (
  appointments: DashboardAppointment[],
  period: DashboardPeriod,
  now: Date
) => {
  if (period === "today") {
    const count = appointments.filter((item) => isSameDay(new Date(item.dateTime), now)).length;
    return [{ label: "Hoje", value: count }];
  }

  if (period === "week") {
    const start = getStartOfWeek(now);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const value = appointments.filter((item) => isSameDay(new Date(item.dateTime), day)).length;

      return {
        label: day.toLocaleDateString("pt-BR", { weekday: "short" }),
        value,
      };
    });
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const checkpoints = [1, 7, 14, 21, daysInMonth];

  return checkpoints.map((dayValue) => {
    const count = appointments.filter((item) => {
      const date = new Date(item.dateTime);
      return date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === dayValue;
    }).length;

    return {
      label: `${dayValue}`,
      value: count,
    };
  });
};
