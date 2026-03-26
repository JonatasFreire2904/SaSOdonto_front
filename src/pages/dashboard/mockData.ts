import type {
  BirthdayPatient,
  DashboardAppointment,
  LabDelivery,
  PendingAlert,
} from "./types";

const now = new Date();

const isoAt = (date: Date, hours: number, minutes = 0) => {
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return copy.toISOString();
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export const dashboardAppointmentsMock: DashboardAppointment[] = [
  {
    id: "apt-1",
    dateTime: isoAt(now, 8, 30),
    patientName: "Mariana Silva",
    procedure: "Limpeza",
    status: "confirmed",
  },
  {
    id: "apt-2",
    dateTime: isoAt(now, 9, 30),
    patientName: "Carlos Mendes",
    procedure: "Canal",
    status: "pending",
  },
  {
    id: "apt-3",
    dateTime: isoAt(now, 11, 0),
    patientName: "Ana Souza",
    procedure: "Avaliação ortodôntica",
    status: "confirmed",
  },
  {
    id: "apt-4",
    dateTime: isoAt(now, 14, 30),
    patientName: "João Pereira",
    procedure: "Extração",
    status: "cancelled",
  },
  {
    id: "apt-5",
    dateTime: isoAt(now, 16, 0),
    patientName: "Roberta Lima",
    procedure: "Restauração",
    status: "confirmed",
  },
  {
    id: "apt-6",
    dateTime: isoAt(addDays(now, 1), 10, 0),
    patientName: "Bruno Alves",
    procedure: "Retorno",
    status: "pending",
  },
  {
    id: "apt-7",
    dateTime: isoAt(addDays(now, 2), 15, 30),
    patientName: "Fernanda Costa",
    procedure: "Clareamento",
    status: "confirmed",
  },
  {
    id: "apt-8",
    dateTime: isoAt(addDays(now, 6), 9, 0),
    patientName: "Daniel Rocha",
    procedure: "Consulta",
    status: "confirmed",
  },
  {
    id: "apt-9",
    dateTime: isoAt(addDays(now, 14), 13, 0),
    patientName: "Paula Nunes",
    procedure: "Lente dental",
    status: "pending",
  },
];

export const birthdayPatientsMock: BirthdayPatient[] = [
  {
    id: "b-1",
    name: "Luciana Torres",
    age: 37,
    whatsapp: "5511999991111",
    birthDate: formatDate(now),
  },
  {
    id: "b-2",
    name: "Mateus Neri",
    age: 29,
    whatsapp: "5511988882222",
    birthDate: formatDate(now),
  },
  {
    id: "b-3",
    name: "Isabela Moura",
    age: 42,
    whatsapp: "5511977773333",
    birthDate: formatDate(addDays(now, 4)),
  },
];

export const labDeliveriesMock: LabDelivery[] = [
  {
    id: "lab-1",
    patientName: "Carla Rodrigues",
    pieceType: "Coroa",
    expectedDate: formatDate(now),
    status: "in_transit",
  },
  {
    id: "lab-2",
    patientName: "Guilherme Prado",
    pieceType: "Lente",
    expectedDate: formatDate(now),
    status: "delivered",
  },
  {
    id: "lab-3",
    patientName: "Renata Lima",
    pieceType: "Prótese parcial",
    expectedDate: formatDate(addDays(now, 2)),
    status: "in_transit",
  },
];

export const pendingAlertsMock: PendingAlert[] = [
  {
    id: "p-1",
    title: "Pacientes sem confirmação",
    description: "4 atendimentos de hoje aguardam confirmação.",
    type: "unconfirmed",
  },
  {
    id: "p-2",
    title: "Procedimentos para aprovação",
    description: "2 planos de tratamento aguardando aprovação.",
    type: "approval",
  },
  {
    id: "p-3",
    title: "Item crítico do dia",
    description: "Paciente com alergia severa sinalizado para 14:30.",
    type: "critical",
  },
];
