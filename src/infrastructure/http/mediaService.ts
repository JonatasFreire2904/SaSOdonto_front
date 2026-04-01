/**
 * INFRASTRUCTURE — Media HTTP Service
 */

import apiClient from "@/infrastructure/http/apiClient";
import type { MediaItem } from "@/domain/types";

export const mediaService = {
  async list(clinicId: string, patientId: string): Promise<MediaItem[]> {
    const response = await apiClient.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/midias`
    );
    return response.data;
  },

  async upload(clinicId: string, patientId: string, file: File): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/midias`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  async remove(clinicId: string, patientId: string, mediaId: string): Promise<void> {
    await apiClient.delete(
      `/clinicas/${clinicId}/pacientes/${patientId}/midias/${mediaId}`
    );
  },
};
