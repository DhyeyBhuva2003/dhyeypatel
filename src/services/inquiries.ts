import apiClient from "@/api/client";

export interface InquiryPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status?: "PENDING" | "CONTACTED" | "RESOLVED";
}

export const inquiriesService = {
  async getAll() {
    const response = await apiClient.get("/inquiries");
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/inquiries/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: "PENDING" | "CONTACTED" | "RESOLVED") {
    const response = await apiClient.patch(`/inquiries/${id}`, { status });
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/inquiries/${id}`);
    return response.data;
  },
};

export default inquiriesService;
