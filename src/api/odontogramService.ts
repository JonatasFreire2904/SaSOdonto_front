import api from "./axiosConfig";

export interface Procedimento {
  id: string;
  name: string;
  category?: string;
}

export interface ToothProcedureRequest {
  toothNumber: number;
  procedureId: string;
  faces: string; // ex: "V,M,O"
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
};
