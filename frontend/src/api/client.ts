import { useSessionStore } from "../store/sessionStore";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export const apiFetch = async <T>(path: string, options: RequestInit = {}) => {
  const token = useSessionStore.getState().token;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Request failed");
  }

  return (await response.json()) as T;
};
