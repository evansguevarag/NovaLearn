export type UserRole =
  | "ADMIN"
  | "INSTRUCTOR"
  | "STUDENT";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginOtpChallenge {
  challengeId: string;
  email: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface LoginResponse {
  requiresOtp: boolean;
  challenge: LoginOtpChallenge | null;
  auth: AuthResponse | null;
}

export interface PasswordResetChallenge {
  challengeId: string;
  email: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface VerifyLoginOtpRequest {
  challengeId: string;
  code: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface CompletePasswordResetRequest {
  challengeId: string;
  code: string;
  newPassword: string;
}

export interface RegisterRequest {
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: number;
  firstName: string | null;
  paternalLastName: string | null;
  maternalLastName: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface EmailAvailability {
  email: string;
  available: boolean;
}

export interface AuthUser {
  userId: number;
  firstName: string | null;
  paternalLastName: string | null;
  maternalLastName: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
}
