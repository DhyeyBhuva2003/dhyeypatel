import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import axios from "axios";
import { Blog } from "@/types";

export interface BlogListResponse {
  blogs: Blog[];
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export function useBlogs(
  filters?: { category?: string; q?: string; page?: number; limit?: number }
): UseQueryResult<BlogListResponse, Error> {
  return useQuery({
    queryKey: queryKeys.blogs.all(filters || {}),
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: BlogListResponse }>("/api/blogs", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(slug),
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: any }>("/api/blogs", {
        params: { slug },
      });
      return data.data;
    },
    enabled: !!slug,
  });
}
