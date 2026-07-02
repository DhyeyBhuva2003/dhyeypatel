export const queryKeys = {
  blogs: {
    all: (filters?: Record<string, any>) => ["blogs", filters] as const,
    detail: (slug: string) => ["blogs", "detail", slug] as const,
  },
  projects: {
    all: (filters?: Record<string, any>) => ["projects", filters] as const,
    detail: (slug: string) => ["projects", "detail", slug] as const,
  },
  services: {
    all: () => ["services"] as const,
    detail: (slug: string) => ["services", "detail", slug] as const,
  },
} as const;
