import { API_CONFIG } from '../config/env';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, status = 500, code = 'API_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('xyz_auth_token');
    }
    return null;
  }

  public getBaseUrl(): string {
    return API_CONFIG.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const token = this.getAuthToken();

    // Construct full URL (clean slashes)
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}` : cleanEndpoint;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.requestTimeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Try parsing JSON response
      let data: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => '');
        data = { message: text };
      }

      if (!response.ok) {
        const status = response.status;
        const msg = 
          (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string')
            ? (data as { message: string }).message
            : `API Request Failed with HTTP ${status}: ${response.statusText}`;

        const code = 
          status === 401 ? 'UNAUTHORIZED' :
          status === 403 ? 'FORBIDDEN' :
          status === 404 ? 'NOT_FOUND' :
          status === 422 ? 'VALIDATION_ERROR' :
          status >= 500 ? 'SERVER_ERROR' : 'API_ERROR';

        throw new ApiError(msg, status, code, data as Record<string, unknown>);
      }

      return data as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError(
          `Request to ${endpoint} timed out after ${API_CONFIG.requestTimeoutMs / 1000}s`,
          408,
          'TIMEOUT'
        );
      }

      const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
      if (isNetworkError) {
        throw new ApiError(
          `Unable to connect to XYZ AI backend at ${baseUrl || '(relative path)'}. Ensure your Python backend is running and CORS is enabled.`,
          0,
          'NETWORK_ERROR'
        );
      }

      throw new ApiError(
        err instanceof Error ? err.message : 'Unknown communication error',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  public async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  public async checkHealth(): Promise<{ ok: boolean; status: number; message?: string }> {
    try {
      await this.get('/api/v1/health');
      return { ok: true, status: 200, message: 'Backend connected and responsive' };
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        return { ok: false, status: err.status, message: err.message };
      }
      return { ok: false, status: 0, message: 'Backend unreachable' };
    }
  }
}

export const apiClient = new ApiClient();
