import { useQuery, useMutation } from "./useApi";
import usersService, { UserParams, UserPayload } from "@/services/users";
import { User, UsersResponse } from "@/types";

export function useUsers(params: UserParams = {}, deps: unknown[] = []) {
  const cacheKey = `users-${JSON.stringify(params)}`;
  return useQuery<UsersResponse>(
    () => usersService.getAll(params),
    [...deps, params.page, params.role, params.status, params.search],
    { cacheKey }
  );
}

export function useCreateUser(onSuccess?: () => void) {
  return useMutation<User, UserPayload>(
    (data: UserPayload) => usersService.create(data),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useUpdateUser(onSuccess?: () => void) {
  return useMutation<User, { id: string; data: UserPayload }>(
    ({ id, data }: { id: string; data: UserPayload }) => usersService.update(id, data),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useDeleteUser(onSuccess?: () => void) {
  return useMutation<{ success: boolean }, string>(
    (id: string) => usersService.delete(id),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}
