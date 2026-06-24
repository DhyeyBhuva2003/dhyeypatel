import { useQuery, useMutation } from "./useApi";
import projectsService, { ProjectPayload } from "@/services/projects";
import { Project } from "@/types";

export function useProjects(deps: unknown[] = []) {
  return useQuery<Project[]>(
    () => projectsService.getAll(),
    deps,
    { cacheKey: "projects-list" }
  );
}

export function useCreateProject(onSuccess?: () => void) {
  return useMutation<Project, ProjectPayload>(
    (data: ProjectPayload) => projectsService.create(data),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useUpdateProject(onSuccess?: () => void) {
  return useMutation<Project, { id: string; data: ProjectPayload }>(
    ({ id, data }: { id: string; data: ProjectPayload }) => projectsService.update(id, data),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}

export function useDeleteProject(onSuccess?: () => void) {
  return useMutation<{ success: boolean }, string>(
    (id: string) => projectsService.delete(id),
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    }
  );
}
