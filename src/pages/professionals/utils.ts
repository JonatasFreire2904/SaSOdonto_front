export const ROLE_LABELS: Record<string, string> = {
  dentista: "Dentista",
  rh: "RH",
  auxiliar: "Auxiliar",
  gestor: "Gestor",
  // PascalCase (backend format)
  Dentista: "Dentista",
  Rh: "RH",
  Auxiliar: "Auxiliar",
  Gestor: "Gestor",
};

export const formatRole = (role: string): string =>
  ROLE_LABELS[role] ?? role;

// Valores enviados ao backend (PascalCase)
export const ROLE_OPTIONS = [
  { value: "Dentista", label: "Dentista" },
  { value: "Rh", label: "RH" },
  { value: "Auxiliar", label: "Auxiliar" },
  { value: "Gestor", label: "Gestor" },
] as const;
