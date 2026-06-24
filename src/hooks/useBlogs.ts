import { useQuery, useMutation } from "./useApi";
import blogsService, { BlogPayload } from "@/services/blogs";
import { Blog } from "@/types";

export function useBlogs(all = true, deps: unknown[] = []) {
  const cacheKey = `blogs-list-${all}`;
  return useQuery<Blog[]>(
    () => blogsService.getAll(all),
    deps,
    { cacheKey }
  );
}

export function useCreateBlog(onSuccess?: () => void) {
  return useMutation<Blog, BlogPayload>(
    (data: BlogPayload) => blogsService.create(data),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useUpdateBlog(onSuccess?: () => void) {
  return useMutation<Blog, { id: string; data: BlogPayload }>(
    ({ id, data }: { id: string; data: BlogPayload }) => blogsService.update(id, data),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useDeleteBlog(onSuccess?: () => void) {
  return useMutation<{ success: boolean }, string>(
    (id: string) => blogsService.delete(id),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}
