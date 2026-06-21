import axios from "axios";

import { clearAuthSession, getAccessToken } from "@/lib/auth-storage";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    });

    api.interceptors.request.use((config) => {
    const token = getAccessToken();
    const url = config.url ?? "";

    const isPublicAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh");

    if (token && !isPublicAuthEndpoint) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
    });

    api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
        const currentPath =
            typeof window !== "undefined" ? window.location.pathname : "";

        const isLoginRequest = error.config?.url?.includes("/auth/login");

        if (!isLoginRequest && typeof window !== "undefined") {
            clearAuthSession();

            if (currentPath !== "/login") {
            window.location.href = "/login";
            }
        }
        }

        return Promise.reject(error);
    }
);