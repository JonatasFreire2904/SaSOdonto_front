import {
  calculateOccupancy,
  filterAppointmentsByPeriod,
  getAppointmentTimingType,
  getOccupancyTone,
  getStatusLabel,
} from "./utils";
import type { DashboardAppointment } from "./types";

const fixedNow = new Date("2026-03-26T10:00:00.000Z");

const appointments: DashboardAppointment[] = [
  {
    id: "a1",
    dateTime: "2026-03-26T09:00:00.000Z",
    patientName: "Paciente 1",
    procedure: "Limpeza",
    status: "confirmed",
  },
  {
    id: "a2",
    dateTime: "2026-03-26T10:20:00.000Z",
    patientName: "Paciente 2",
    procedure: "Consulta",
    status: "pending",
  },
  {
    id: "a3",
    dateTime: "2026-03-27T11:00:00.000Z",
    patientName: "Paciente 3",
    procedure: "Canal",
    status: "cancelled",
  },
];

describe("dashboard utils", () => {
  it("calcula ocupação corretamente", () => {
    const occupancy = calculateOccupancy(appointments, "today");

    expect(occupancy.totalSlots).toBe(12);
    expect(occupancy.filledSlots).toBe(2);
    expect(occupancy.freeSlots).toBe(10);
    expect(occupancy.occupancyRate).toBe(17);
  });

  it("filtra agendamentos por período", () => {
    const todayAppointments = filterAppointmentsByPeriod(appointments, "today", fixedNow);
    expect(todayAppointments).toHaveLength(2);
  });

  it("retorna label de status corretamente", () => {
    expect(getStatusLabel("confirmed")).toBe("Confirmado");
    expect(getStatusLabel("pending")).toBe("Pendente");
    expect(getStatusLabel("cancelled")).toBe("Cancelado");
  });

  it("identifica timing de agendamento", () => {
    expect(getAppointmentTimingType(appointments[0], fixedNow)).toBe("overdue");
    expect(getAppointmentTimingType(appointments[1], fixedNow)).toBe("upcoming");
  });

  it("aplica tom de ocupação por faixa", () => {
    expect(getOccupancyTone(82)).toBe("high");
    expect(getOccupancyTone(65)).toBe("medium");
    expect(getOccupancyTone(20)).toBe("low");
  });
});
