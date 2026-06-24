import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

interface QueryOptions<T> {
  enabled?: boolean;
  cacheKey?: string;
  retry?: number;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
}

interface MutationOptions<T, P> {
  onSuccess?: (data: T, payload: P) => void;
  onError?: (err: unknown) => void;
  optimisticUpdate?: (payload: P) => void;
  rollback?: () => void;
}

// In-memory query cache
const queryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function useQuery<T>(
  queryFn: () => Promise<{ success: boolean; data: T; message?: string }>,
  deps: unknown[] = [],
  options: QueryOptions<T> = {}
) {
  const { enabled = true, cacheKey, initialData } = options;

  const [data, setData] = useState<T | undefined>(() => {
    if (cacheKey && queryCache.has(cacheKey)) {
      const cached = queryCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
        return cached.data as T;
      }
    }
    return initialData;
  });

  const [loading, setLoading] = useState(enabled && (!cacheKey || !queryCache.has(cacheKey)));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Keep references to prevent recreating functions and violating react-hooks rules
  const queryFnRef = useRef(queryFn);
  const optionsRef = useRef(options);

  useEffect(() => {
    queryFnRef.current = queryFn;
    optionsRef.current = options;
  });

  const execute = useCallback(async (): Promise<T | undefined> => {
    let attempts = 0;
    const maxRetry = optionsRef.current.retry ?? 1;
    const currentQueryFn = queryFnRef.current;
    const currentOptions = optionsRef.current;

    while (attempts <= maxRetry) {
      setLoading(true);
      setError(null);
      try {
        const result = await currentQueryFn();
        if (result.success) {
          setData(result.data);
          setSuccess(true);
          if (currentOptions.cacheKey) {
            queryCache.set(currentOptions.cacheKey, { data: result.data, timestamp: Date.now() });
          }
          if (currentOptions.onSuccess) currentOptions.onSuccess(result.data);
          return result.data;
        } else {
          throw new Error(result.message || "Failed to load details");
        }
      } catch (err: unknown) {
        attempts++;
        if (attempts <= maxRetry) {
          console.warn(`Query failed. Retrying... (${attempts}/${maxRetry})`);
          continue;
        }
        const errorObj = err as { message?: string };
        const message = errorObj.message || String(err) || "Network error loading resources.";
        setError(message);
        if (currentOptions.onError) currentOptions.onError(err);
        toast.error(message);
        break;
      } finally {
        setLoading(false);
      }
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (enabled) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, execute, ...deps]);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      queryCache.delete(cacheKey);
    }
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    success,
    isEmpty: !loading && (!data || (Array.isArray(data) && data.length === 0)),
    refetch: execute,
    invalidateCache,
    setData,
  };
}

export function useMutation<T, P = void>(
  mutationFn: (payload: P) => Promise<{ success: boolean; data: T; message?: string }>,
  options: MutationOptions<T, P> = {}
) {
  const { onSuccess, onError, optimisticUpdate, rollback } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutate = useCallback(
    async (payload: P): Promise<T | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (optimisticUpdate) {
        optimisticUpdate(payload);
      }

      try {
        const result = await mutationFn(payload);
        if (result.success) {
          setSuccess(true);
          toast.success(result.message || "Action completed successfully!");
          if (onSuccess) onSuccess(result.data, payload);
          return result.data;
        } else {
          throw new Error(result.message || "Action failed");
        }
      } catch (err: unknown) {
        if (rollback) {
          rollback();
        }
        const errorObj = err as { message?: string };
        const message = errorObj.message || String(err) || "An unexpected error occurred.";
        setError(message);
        toast.error(message);
        if (onError) onError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, optimisticUpdate, rollback]
  );

  return {
    mutate,
    loading,
    error,
    success,
  };
}
