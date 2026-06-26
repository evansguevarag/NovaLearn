import type {
  AuthResponse,
  AuthUser,
} from "@/features/auth/types/auth.types";

const ACCESS_TOKEN_KEY =
  "novalearn_access_token";

const LEGACY_REFRESH_TOKEN_KEY =
  "novalearn_refresh_token";

const USER_KEY =
  "novalearn_user";

export const AUTH_STORAGE_EVENT =
  "novalearn-auth-storage";

export function saveAuthSession(
  auth: AuthResponse
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    auth.accessToken
  );

  /*
   * Se elimina cualquier refresh token antiguo.
   * El refresh token actual vive únicamente en
   * una cookie HttpOnly administrada por el backend.
   */
  localStorage.removeItem(
    LEGACY_REFRESH_TOKEN_KEY
  );

  const user: AuthUser = {
    userId: auth.userId,
    email: auth.email,
    role: auth.role,
    status: auth.status,
  };

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

  notifyAuthStorageChange();
}

export function getAccessToken():
  | string
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

export function getAuthUser():
  | AuthUser
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser =
    localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(
      storedUser
    ) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    LEGACY_REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );

  notifyAuthStorageChange();
}

function notifyAuthStorageChange(): void {
  window.dispatchEvent(
    new Event(AUTH_STORAGE_EVENT)
  );
}