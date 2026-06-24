import apiClient from "@/api/client";

export interface BlogPayload {
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  category: string;
  published?: boolean;
  readTime: string;
}

export const blogsService = {
  async getAll(all = true) {
    const response = await apiClient.get("/blogs", {
      params: { all: all ? "true" : "false" },
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/blogs/${id}`);
    return response.data;
  },

  async create(data: BlogPayload) {
    const response = await apiClient.post("/blogs", data);
    return response.data;
  },

  async update(id: string, data: BlogPayload) {
    const response = await apiClient.put(`/blogs/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/blogs/${id}`);
    return response.data;
  },
};

export default blogsService;
