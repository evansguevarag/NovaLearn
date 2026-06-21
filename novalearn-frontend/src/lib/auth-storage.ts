import type { AuthResponse } from "@/features/auth/types/auth.types";

const ACCESS_TOKEN_KEY = "novalearn_access_token";
const REFRESH_TOKEN_KEY = "novalearn_refresh_token";
const USER_KEY = "novalearn_user";

export const AUTH_STORAGE_EVENT = "novalearn-auth-storage";
export function saveAuthSession(auth: AuthResponse): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: auth.userId,
      email: auth.email,
      role: auth.role,
      status: auth.status,
    })
  );

  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAuthUser(): {
  userId: number;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  status: string;
} | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;

  return JSON.parse(user);
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}