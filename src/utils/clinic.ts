/**
 * Obtém o clinicId do localStorage
 * Compatível com formato legado (selectedClinicId) e novo (selectedClinic JSON)
 */
export const getClinicId = (): string => {
  try {
    const stored = localStorage.getItem("selectedClinic");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.id || parsed.clinicId || localStorage.getItem("selectedClinicId") || "";
    }
  } catch { /* fallback */ }
  return localStorage.getItem("selectedClinicId") || "";
};
