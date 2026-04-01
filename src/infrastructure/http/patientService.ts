/**
 * INFRASTRUCTURE — Patient HTTP Service
 * Usa o responseAdapter para normalizar formatos de resposta.
 * A normalização de 'name' vs 'fullName' é tratada em um único lugar.
 *
 * TODO (Backend): padronizar campo para 'name' e remover compatibilidade com 'fullName'
 */

import apiClient from "@/infrastructure/http/apiClient";
import { normalizePaged } from "@/infrastructure/adapters/responseAdapter";
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  ListPatientsParams,
  PatientStatus,
} from "@/domain/types";
import type { PagedResponse } from "@/domain/types";

function normalizePatient(raw: unknown): Patient {
  const p = raw as Record<string, unknown>;
  return {
    ...(raw as Patient),
    name: ((p.name ?? p.fullName) as string) ?? "",
  };
}

export const patientService = {
  async list(
    clinicId: string,
    params: ListPatientsParams = {}
  ): Promise<PagedResponse<Patient>> {
    const { page = 1, pageSize = 10, search, status = "Active", signal } = params;
    const response = await apiClient.get(`/clinicas/${clinicId}/pacientes`, {
      params: { page, pageSize, search: search || undefined, status },
      signal,
    });

    const paged = normalizePaged<Patient>(response.data, page, pageSize);
    return {
      ...paged,
      items: paged.items.map((p) => normalizePatient(p)),
    };
  },

  async getById(clinicId: string, patientId: string): Promise<Patient> {
    const response = await apiClient.get(`/clinicas/${clinicId}/pacientes/${patientId}`);
    return normalizePatient(response.data as unknown);
  },

  async create(clinicId: string, data: CreatePatientRequest): Promise<Patient> {
    const response = await apiClient.post(`/clinicas/${clinicId}/pacientes`, {
      ...data,
      fullName: data.fullName,
    });
    return normalizePatient(response.data as unknown);
  },

  async update(
    clinicId: string,
    patientId: string,
    data: UpdatePatientRequest
  ): Promise<Patient> {
    const response = await apiClient.put(
      `/clinicas/${clinicId}/pacientes/${patientId}`,
      { ...data, fullName: data.fullName }
    );
    return normalizePatient(response.data as unknown);
  },

  async updateStatus(
    clinicId: string,
    patientId: string,
    status: PatientStatus
  ): Promise<Patient> {
    const response = await apiClient.patch(
      `/clinicas/${clinicId}/pacientes/${patientId}/status`,
      { status }
    );
    return normalizePatient(response.data as unknown);
  },

  async remove(clinicId: string, patientId: string): Promise<void> {
    await apiClient.delete(`/clinicas/${clinicId}/pacientes/${patientId}`);
  },
};
