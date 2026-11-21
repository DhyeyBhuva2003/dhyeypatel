import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import axios from "axios";
import { Service } from "@/types";

export function useServices(): UseQueryResult<Service[], Error> {
  return useQuery({
    queryKey: queryKeys.services.all(),
    queryFn: async () => {
      const { data } = await axios.get<{ success: boolean; data: Service[] }>("/api/services");
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });
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
