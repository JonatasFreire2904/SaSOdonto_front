import api from "./axiosConfig";

export interface Procedimento {
  id: string;
  name: string;
  category?: string;
  isDefault?: boolean;
}

export interface ToothProcedureRequest {
  toothNumber: number;
  procedureId: string;
  faces: string; // "V,M,O"
  notes?: string;
}

export interface ToothProcedureResponse {
  id: string;
  toothNumber: number;
  procedureId: string;
  procedureName: string;
  faces: string;
  notes: string | null;
  createdAt: string;
}

export interface UpdateToothStatusRequest {
  status: string;
  notes?: string;
}

export const odontogramService = {
  async getProcedimentos(clinicId: string): Promise<Procedimento[]> {
    const response = await api.get(`/clinicas/${clinicId}/procedimentos`);
    return response.data;
  },

  async addToothProcedure(
    clinicId: string,
    patientId: string,
    data: ToothProcedureRequest
  ): Promise<ToothProcedureResponse> {
    const response = await api.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/odontograma/procedimentos`,
      data
    );
    return response.data;
  },

  async updateToothStatus(
    clinicId: string,
    patientId: string,
    toothNumber: number,
    data: UpdateToothStatusRequest
  ): Promise<void> {
    await api.put(
      `/clinicas/${clinicId}/pacientes/${patientId}/odontograma/${toothNumber}`,
      data
    );
  },

  async getPatientProcedures(
    clinicId: string,
    patientId: string
  ): Promise<ToothProcedureResponse[]> {
    const response = await api.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/odontograma/procedimentos`
    );
    return response.data;
  },

  async deleteToothProcedure(
    clinicId: string,
    patientId: string,
    procedureId: string
  ): Promise<void> {
    await api.delete(
      `/clinicas/${clinicId}/pacientes/${patientId}/odontograma/procedimentos/${procedureId}`
    );
  },

  async createCustomProcedure(
    clinicId: string,
    data: { name: string; category?: string }
  ): Promise<Procedimento> {
    const response = await api.post(`/clinicas/${clinicId}/procedimentos`, data);
    return response.data;
  },

  async deleteClinicProcedure(
    clinicId: string,
    procedureId: string
  ): Promise<void> {
    await api.delete(`/clinicas/${clinicId}/procedimentos/${procedureId}`);
  },
};
