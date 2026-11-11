import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { WorkspaceBootstrapDto } from '@kivo/api-client';

export function useWorkspace(slug?: string) {
  const query = useQuery({
    queryKey: ['workspace', slug, 'bootstrap'],
    queryFn: async (): Promise<WorkspaceBootstrapDto | null> => {
      if (!slug) return null;
      const res = await apiClient.workspaces.bootstrap(slug);
      return res.data?.bootstrap ?? null;
    },
    enabled: Boolean(slug),
    retry: false,
    staleTime: 1000 * 30, // 30s cache freshness
  });

  return {
    bootstrap: query.data ?? null,
    workspace: query.data?.workspace ?? null,
    membership: query.data?.membership ?? null,
    counts: query.data?.counts ?? null,
    accessibleWorkspaces: query.data?.accessibleWorkspaces ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
