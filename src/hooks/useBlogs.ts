import { useQuery, useMutation, UseQueryResult } from "@tanstack/react-query";
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
  filters: { category?: string; q?: string; page?: number; limit?: number }
): UseQueryResult<BlogListResponse, Error>;

export function useBlogs(
  all: boolean,
  deps?: unknown[]
): { data: Blog[]; loading: boolean; error: string | null; refetch: () => void };

export function useBlogs(
  filtersOrAll?: { category?: string; q?: string; page?: number; limit?: number } | boolean,
  deps?: unknown[]
): any {
  const isPublicSignature = typeof filtersOrAll === "object" && filtersOrAll !== null;

  // Determine filters
  const filters = isPublicSignature
    ? (filtersOrAll as any)
    : { all: filtersOrAll ?? true };

  const query = useQuery({
    queryKey: queryKeys.blogs.all(filters),
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: BlogListResponse | Blog[] }>("/api/blogs", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: isPublicSignature ? (previousData: any) => previousData : undefined,
  });

  if (isPublicSignature) {
    return query;
  }

  // Compatibility wrapper for Admin page
  const dataArray = Array.isArray(query.data)
    ? query.data
    : (query.data && typeof query.data === "object" && "blogs" in query.data && Array.isArray(query.data.blogs))
    ? query.data.blogs
    : [];

  return {
    data: dataArray,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
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

export function useCreateBlog(onSuccess?: () => void) {
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post("/api/blogs", payload);
      return data.data;
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });
  return {
    mutate: mutation.mutate,
    loading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
    success: mutation.isSuccess,
  };
}

export function useUpdateBlog(onSuccess?: () => void) {
  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await axios.put(`/api/blogs/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });
  return {
    mutate: mutation.mutate,
    loading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
    success: mutation.isSuccess,
  };
}

export function useDeleteBlog(onSuccess?: () => void) {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/blogs/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });
  return {
    mutate: mutation.mutate,
    loading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
    success: mutation.isSuccess,
  };
}
