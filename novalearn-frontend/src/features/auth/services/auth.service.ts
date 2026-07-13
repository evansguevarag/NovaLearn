import type {
  AuthResponse,
  EmailAvailability,
  LoginRequest,
  LoginResponse,
  PasswordResetChallenge,
  PasswordResetRequest,
  RegisterRequest,
  CompletePasswordResetRequest,
  VerifyLoginOtpRequest,
} from "../types/auth.types";

import { api } from "@/lib/api";

export async function login(
  request: LoginRequest
): Promise<LoginResponse> {
  const response =
    await api.post<LoginResponse>(
      "/auth/login",
      request
    );

  return response.data;
}

export async function verifyLoginOtp(
  request: VerifyLoginOtpRequest
): Promise<AuthResponse> {
  const response =
    await api.post<AuthResponse>(
      "/auth/login/verify-otp",
      request
    );

  return response.data;
}

export async function requestPasswordReset(
  request: PasswordResetRequest
): Promise<PasswordResetChallenge> {
  const response =
    await api.post<PasswordResetChallenge>(
      "/auth/password-reset/request",
      request
    );

  return response.data;
}

export async function completePasswordReset(
  request: CompletePasswordResetRequest
): Promise<void> {
  await api.post(
    "/auth/password-reset/complete",
    request
  );
}

export async function register(
  request: RegisterRequest
): Promise<AuthResponse> {
  const response =
    await api.post<AuthResponse>(
      "/auth/register",
      request
    );

  return response.data;
}

export async function checkEmailAvailability(
  email: string
): Promise<EmailAvailability> {
  const response =
    await api.get<EmailAvailability>(
      "/auth/email-availability",
      {
        params: {
          email,
        },
      }
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
