import apiClient from "@/api/client";

export const dashboardService = {
  async getMetrics(range = 30) {
    const response = await apiClient.get("/admin/analytics", {
      params: { range },
    });
    return response.data;
  },
};

export default dashboardService;
