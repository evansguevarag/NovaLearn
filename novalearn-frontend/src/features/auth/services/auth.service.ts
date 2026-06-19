import { api } from "@/lib/api";
import type { AuthResponse, LoginRequest } from "../types/auth.types";

export async function login(request: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", request);
    return response.data;
}