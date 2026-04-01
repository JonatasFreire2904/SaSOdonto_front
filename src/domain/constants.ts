/**
 * DOMAIN LAYER — Constantes do domínio
 * Valores de domínio vindos do backend devem ser consumidos via API, não hardcoded.
 * Aqui ficam apenas constantes de apresentação (labels, mapeamentos UI).
 */

export const STATUS_LABELS: Record<string, string> = {
  Scheduled: "Agendado",
  InProgress: "Em Andamento",
  Completed: "Concluído",
  Cancelled: "Cancelado",
  Pending: "Pendente",
  Active: "Ativo",
  Inactive: "Inativo",
  Suspended: "Suspenso",
  Planned: "Planejado",
};

export const STATUS_CLASSES: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  InProgress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  Suspended: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Planned: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export const PROFESSIONAL_ROLE_LABELS: Record<string, string> = {
  Dentista: "Dentista",
  Auxiliar: "Auxiliar",
  Rh: "RH",
  Gestor: "Gestor",
};

export const PAYMENT_METHOD_LABELS: Record<number, string> = {
  0: "Pix",
  1: "Dinheiro",
  2: "Cartão de Crédito",
  3: "Cartão de Débito",
};

export function getStatusInfo(status: string | undefined | null): {
  label: string;
  className: string;
} {
  if (!status) {
    return {
      label: "Desconhecido",
      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    };
  }
  return {
    label: STATUS_LABELS[status] ?? status,
    className:
      STATUS_CLASSES[status] ??
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
}
