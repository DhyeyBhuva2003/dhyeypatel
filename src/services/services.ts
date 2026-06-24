import apiClient from "@/api/client";

export interface ServicePayload {
  title: string;
  description: string;
  icon: string;
  features: string[];
  price: string;
  order?: number;
}

export const servicesService = {
  async getAll() {
    const response = await apiClient.get("/services");
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  async create(data: ServicePayload) {
    const response = await apiClient.post("/services", data);
    return response.data;
  },

  async update(id: string, data: ServicePayload) {
    const response = await apiClient.put(`/services/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  },
};

export default servicesService;
