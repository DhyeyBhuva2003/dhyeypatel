import { useQuery, useMutation, UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import axios from "axios";
import { Service } from "@/types";

export function useServices(
  deps: unknown[]
): { data: Service[]; loading: boolean; error: string | null; refetch: () => void };

export function useServices(): UseQueryResult<Service[], Error>;

export function useServices(depsOrOptions?: unknown[] | any): any {
  const isCompat = Array.isArray(depsOrOptions);
  
  const query = useQuery({
    queryKey: queryKeys.services.all(),
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: Service[] }>("/api/services");
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });

  if (isCompat) {
    return {
      data: query.data || [],
      loading: query.isLoading,
      error: query.error ? query.error.message : null,
      refetch: query.refetch,
    };
  }

  return query;
}

export function useServiceDetails(slug: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(slug),
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: any }>("/api/services", {
        params: { slug },
      });
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useCreateService(onSuccess?: () => void) {
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post("/api/services", payload);
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

export function useUpdateService(onSuccess?: () => void) {
  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await axios.put(`/api/services/${id}`, data);
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

export function useDeleteService(onSuccess?: () => void) {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/services/${id}`);
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
