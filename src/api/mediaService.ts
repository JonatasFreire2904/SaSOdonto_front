import api from "./axiosConfig";

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "pdf" | "document";
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

export const mediaService = {
  async list(clinicId: string, patientId: string): Promise<MediaItem[]> {
    const response = await api.get(
      `/clinicas/${clinicId}/pacientes/${patientId}/midias`
    );
    return response.data;
  },

  async upload(clinicId: string, patientId: string, file: File): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `/clinicas/${clinicId}/pacientes/${patientId}/midias`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  async remove(clinicId: string, patientId: string, mediaId: string): Promise<void> {
    await api.delete(
      `/clinicas/${clinicId}/pacientes/${patientId}/midias/${mediaId}`
    );
  },
};
