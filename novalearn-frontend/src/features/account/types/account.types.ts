import type { AuthResponse } from "@/features/auth/types/auth.types";

export interface AccountProfile {
  id: number;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  email: string;
  role: string;
  status: string;
}

export interface UpdateAccountProfileRequest {
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailChangeChallenge {
  challengeId: string;
  maskedEmail: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface RequestEmailChangeRequest {
  email: string;
}

export interface ConfirmEmailChangeRequest {
  challengeId: string;
  code: string;
}

export interface ConfirmEmailChangeResponse {
  profile: AccountProfile;
  auth: AuthResponse;
}
