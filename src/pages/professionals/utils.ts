export const ROLE_LABELS: Record<string, string> = {
  dentista: "Dentista",
  rh: "RH",
  auxiliar: "Auxiliar",
  gestor: "Gestor",
};

export const formatRole = (role: string): string =>
  ROLE_LABELS[role.toLowerCase()] ?? role;
