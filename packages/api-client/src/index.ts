/**
 * @kivo/api-client
 *
 * Typed REST client contracts and operations for KIVO.
 * No business or domain logic belongs here.
 */

export interface ApiClientConfig {
  baseUrl?: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
}

export interface AccountDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponseData {
  account: AccountDto;
  token?: string;
  expiresAt?: string;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = config.baseUrl ?? '';
  const defaultCredentials = config.credentials ?? 'include';

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials ?? defaultCredentials,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      let errorDetails: unknown;
      try {
        const errorJson = (await response.json()) as { message?: string; error?: string };
        errorMessage = errorJson.message || errorJson.error || errorMessage;
        errorDetails = errorJson;
      } catch {
        // Fallback to text or default message
      }
      throw new ApiError(response.status, errorMessage, errorDetails);
    }

    return (await response.json()) as T;
  }

  return {
    getBaseUrl: () => baseUrl,
    auth: {
      register: (input: RegisterInput) =>
        request<ApiResponse<{ account: AccountDto }>>('/api/v1/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      login: (input: LoginInput) =>
        request<ApiResponse<AuthResponseData>>('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      logout: () =>
        request<ApiResponse<null>>('/api/v1/auth/logout', {
          method: 'POST',
        }),
      me: () =>
        request<ApiResponse<{ account: AccountDto }>>('/api/v1/auth/me', {
          method: 'GET',
        }),
    },
    workspaces: {
      create: (input: CreateWorkspaceInput) =>
        request<ApiResponse<{ workspace: WorkspaceDto }>>('/api/v1/workspaces', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      list: () =>
        request<ApiResponse<{ workspaces: WorkspaceDto[] }>>('/api/v1/workspaces', {
          method: 'GET',
        }),
      getBySlug: (slug: string) =>
        request<ApiResponse<{ workspace: WorkspaceDto }>>(
          `/api/v1/workspaces/${encodeURIComponent(slug)}`,
          {
            method: 'GET',
          },
        ),
      update: (slug: string, input: UpdateWorkspaceInput) =>
        request<ApiResponse<{ workspace: WorkspaceDto }>>(
          `/api/v1/workspaces/${encodeURIComponent(slug)}`,
          {
            method: 'PATCH',
            body: JSON.stringify(input),
          },
        ),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
