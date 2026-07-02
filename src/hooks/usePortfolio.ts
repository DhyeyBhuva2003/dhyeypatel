import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import axios from "axios";

export function usePortfolio(filters?: { category?: string }) {
  return useQuery({
    queryKey: queryKeys.projects.all(filters || {}),
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: any[] }>("/api/projects", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePortfolioDetails(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: any }>("/api/projects", {
        params: { slug },
      });
      return data.data;
    },
    enabled: !!slug,
  });
}
