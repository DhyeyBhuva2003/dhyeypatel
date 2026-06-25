import { useQuery, useMutation } from "./useApi";
import inquiriesService from "@/services/inquiries";
import { Inquiry } from "@/types";

export function useInquiries(deps: unknown[] = []) {
  return useQuery<Inquiry[]>(
    () => inquiriesService.getAll(),
    deps,
    { cacheKey: "inquiries-list" }
  );
}

export function useUpdateInquiryStatus(onSuccess?: () => void) {
  return useMutation<Inquiry, { id: string; status: "PENDING" | "CONTACTED" | "RESOLVED" }>(
    ({ id, status }: { id: string; status: "PENDING" | "CONTACTED" | "RESOLVED" }) =>
      inquiriesService.updateStatus(id, status),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useDeleteInquiryAttachment(onSuccess?: () => void) {
  return useMutation<Inquiry, string>(
    (id: string) => inquiriesService.deleteAttachment(id),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useDeleteInquiry(onSuccess?: () => void) {
  return useMutation<{ success: boolean }, string>(
    (id: string) => inquiriesService.delete(id),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}
