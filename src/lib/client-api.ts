"use client";

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ path?: Array<string | number>; message?: string }>;
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, errors?: ApiEnvelope<never>["errors"]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = {};
    errors?.forEach((issue) => {
      const field = issue.path?.[0];
      if (field !== undefined && issue.message) this.fieldErrors[String(field)] = issue.message;
    });
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  let body: ApiEnvelope<T>;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError("The server returned an unexpected response.", response.status);
  }

  if (!response.ok || !body.success) {
    const isLoginRequest = path.startsWith("/api/auth/login");
    if (response.status === 401 && !isLoginRequest && typeof window !== "undefined") {
      const returnTo = encodeURIComponent(window.location.pathname);
      window.location.assign(`/admin/login?expired=1&returnTo=${returnTo}`);
    }
    throw new ApiError(body.message || "Unable to process request.", response.status, body.errors);
  }

  return body.data as T;
}

export const adminApi = {
  login: (email: string, password: string) =>
    apiRequest<{ id: number; email: string; fullName: string; role: string; mustChangePassword: boolean }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  me: () => apiRequest<{ authenticated: boolean; administrator: { id: number; email: string; fullName: string } | null }>("/api/auth/me", { cache: "no-store" }),
  logout: () => apiRequest<{ loggedOut: boolean }>("/api/auth/logout", { method: "POST" }),
  list: <T>(entity: string, query: URLSearchParams) =>
    apiRequest<{ items: T[]; pagination: { page: number; pageSize: number; total: number } }>(
      `/api/${entity}?${query.toString()}`
    ),
  create: <T>(entity: string, payload: Record<string, unknown>) =>
    apiRequest<T>(`/api/${entity}`, { method: "POST", body: JSON.stringify(payload) }),
  update: <T>(entity: string, id: number, payload: Record<string, unknown>) =>
    apiRequest<T>(`/api/${entity}/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (entity: string, id: number) =>
    apiRequest<{ deleted: boolean }>(`/api/${entity}/${id}`, { method: "DELETE" }),
  updateMessage: <T>(id: number, status: string) =>
    apiRequest<T>(`/api/messages/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ changed: boolean }>("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};
