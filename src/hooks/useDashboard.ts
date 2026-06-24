import { useQuery } from "./useApi";
import dashboardService from "@/services/dashboard";
import { DashboardStats } from "@/types";

interface UseDashboardOptions {
  enabled?: boolean;
  initialData?: DashboardStats;
  onSuccess?: (data: DashboardStats) => void;
  onError?: (err: unknown) => void;
}

export function useDashboardStats(range = 30, deps: unknown[] = [], options?: UseDashboardOptions) {
  const cacheKey = `dashboard-stats-${range}`;
  return useQuery<DashboardStats>(
    () => dashboardService.getMetrics(range),
    [...deps, range],
    { cacheKey, ...options }
  );
}

export default useDashboardStats;
