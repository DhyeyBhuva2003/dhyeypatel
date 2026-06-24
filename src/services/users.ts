import apiClient from "@/api/client";

export interface UserParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  profileImage?: {
    public_id: string;
    secure_url: string;
  } | null;
}

export const usersService = {
  async getAll(params: UserParams = {}) {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  async create(data: UserPayload) {
    const response = await apiClient.post("/admin/users", data);
    return response.data;
  },

  async update(id: string, data: UserPayload) {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default usersService;
