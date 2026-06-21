import axios from "axios";
import { getAccessToken } from "@/lib/auth-storage";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    });

    api.interceptors.request.use((config) => {
    const token = getAccessToken();
    const url = config.url ?? "";

    const isAuthPublicEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh");

    if (token && !isAuthPublicEndpoint) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});