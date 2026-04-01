/**
 * INFRASTRUCTURE — Clinic Storage Adapter
 * Abstrai leitura/escrita dos dados da clínica selecionada no localStorage.
 * Remove compatibilidade com formato legado em um único lugar.
 */

const CLINIC_KEY = "selectedClinic";
const CLINIC_ID_LEGACY_KEY = "selectedClinicId";

export interface StoredClinic {
  id: string;
  name: string;
  location?: string;
}

export const clinicStorage = {
  getClinicId(): string {
    try {
      const stored = localStorage.getItem(CLINIC_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredClinic;
        return parsed.id ?? "";
      }
    } catch {
      // fallback legado
    }
    return localStorage.getItem(CLINIC_ID_LEGACY_KEY) ?? "";
  },

  getClinic(): StoredClinic | null {
    try {
      const stored = localStorage.getItem(CLINIC_KEY);
      if (stored) return JSON.parse(stored) as StoredClinic;
    } catch {
      // fallback legado
    }
    const legacyId = localStorage.getItem(CLINIC_ID_LEGACY_KEY);
    if (legacyId) return { id: legacyId, name: "" };
    return null;
  },

  setClinic(clinic: StoredClinic): void {
    localStorage.setItem(CLINIC_KEY, JSON.stringify(clinic));
    // Remove chave legada ao salvar no formato novo
    localStorage.removeItem(CLINIC_ID_LEGACY_KEY);
  },

  clear(): void {
    localStorage.removeItem(CLINIC_KEY);
    localStorage.removeItem(CLINIC_ID_LEGACY_KEY);
  },
};
