export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || 'API request failed');
    }

    return res.json();
  }

  get<T = any>(path: string, params?: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value));
      });
    }
    const queryString = searchParams.toString();
    return this.request<T>(`${path}${queryString ? `?${queryString}` : ''}`);
  }

  post<T = any>(path: string, data?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T = any>(path: string, data: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T = any>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
