import { useQuery, useMutation } from "./useApi";
import servicesService, { ServicePayload } from "@/services/services";
import { Service } from "@/types";

export function useServices(deps: unknown[] = []) {
  return useQuery<Service[]>(
    () => servicesService.getAll(),
    deps,
    { cacheKey: "services-list" }
  );
}

export function useCreateService(onSuccess?: () => void) {
  return useMutation<Service, ServicePayload>(
    (data: ServicePayload) => servicesService.create(data),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useUpdateService(onSuccess?: () => void) {
  return useMutation<Service, { id: string; data: ServicePayload }>(
    ({ id, data }: { id: string; data: ServicePayload }) => servicesService.update(id, data),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useDeleteService(onSuccess?: () => void) {
  return useMutation<{ success: boolean }, string>(
    (id: string) => servicesService.delete(id),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}
