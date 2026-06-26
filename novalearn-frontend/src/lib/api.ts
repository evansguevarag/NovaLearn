import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import type { AuthResponse } from "@/features/auth/types/auth.types";
import {
  clearAuthSession,
  getAccessToken,
  saveAuthSession,
} from "@/lib/auth-storage";

interface RetryableRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL =
  process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise:
  | Promise<AuthResponse>
  | null = null;

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    const requestUrl =
      config.url ?? "";

    const isPublicAuthEndpoint =
      isAuthEndpoint(requestUrl);

    if (
      token &&
      !isPublicAuthEndpoint
    ) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

api.interceptors.response.use(
  (
    response: AxiosResponse
  ): AxiosResponse => response,
  async (
    error: AxiosError
  ): Promise<AxiosResponse> => {
    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined;

    const status =
      error.response?.status;

    const requestUrl =
      originalRequest?.url ?? "";

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(requestUrl)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const renewedSession =
        await refreshAccessToken();

      originalRequest.headers.Authorization =
        `Bearer ${renewedSession.accessToken}`;

      return await api(originalRequest);
    } catch (refreshError) {
      closeExpiredSession();

      return Promise.reject(
        refreshError
      );
    }
  }
);

async function refreshAccessToken():
  Promise<AuthResponse> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<AuthResponse>(
        "/auth/refresh"
      )
      .then((response) => {
        saveAuthSession(
          response.data
        );

        return response.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function isAuthEndpoint(
  requestUrl: string
): boolean {
  return (
    requestUrl.includes(
      "/auth/login"
    ) ||
    requestUrl.includes(
      "/auth/register"
    ) ||
    requestUrl.includes(
      "/auth/refresh"
    ) ||
    requestUrl.includes(
      "/auth/logout"
    )
  );
}

function closeExpiredSession(): void {
  clearAuthSession();

  if (
    typeof window !== "undefined" &&
    window.location.pathname !==
      "/login"
  ) {
    window.location.href =
      "/login";
  }
}