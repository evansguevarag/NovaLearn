import type {
  AuthResponse,
  LoginRequest,
} from "../types/auth.types";

import { api } from "@/lib/api";

export async function login(
  request: LoginRequest
): Promise<AuthResponse> {
  const response =
    await api.post<AuthResponse>(
      "/auth/login",
      request
    );

  return response.data;
}

export async function refreshSession():
  Promise<AuthResponse> {
  const response =
    await api.post<AuthResponse>(
      "/auth/refresh"
    );

  return response.data;
}

export async function logout():
  Promise<void> {
  await api.post(
    "/auth/logout"
  );
}