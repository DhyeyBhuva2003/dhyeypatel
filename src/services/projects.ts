import apiClient from "@/api/client";

export interface ProjectPayload {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  order?: number;
  category?: string;
  shortDescription?: string;
  fullDescription?: string;
  projectType?: string;
  clientName?: string;
  industry?: string;
  duration?: string;
  status?: "Completed" | "In Progress";
  technologies?: string[];
  features?: string[];
  challenges?: string[];
  solutions?: string[];
  gallery?: { image: string; alt: string }[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export const projectsService = {
  async getAll() {
    const response = await apiClient.get("/projects");
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  async create(data: ProjectPayload) {
    const response = await apiClient.post("/projects", data);
    return response.data;
  },

  async update(id: string, data: ProjectPayload) {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectsService;
