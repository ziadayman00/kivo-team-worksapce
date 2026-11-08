/**
 * @kivo/api-client
 *
 * This package holds the typed REST client generated strictly from
 * the backend OpenAPI 3.x contract. No business or domain logic belongs here.
 */

export interface ApiClientConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
  timestamp: string;
}

export function createApiClient(config: ApiClientConfig) {
  return {
    getBaseUrl: () => config.baseUrl,
  };
}
