import { api } from "@/lib/api";

import type {
  AccountProfile,
  ChangePasswordRequest,
  ConfirmEmailChangeRequest,
  ConfirmEmailChangeResponse,
  EmailChangeChallenge,
  RequestEmailChangeRequest,
  UpdateAccountProfileRequest,
} from "@/features/account/types/account.types";

export async function getAccountProfile(): Promise<AccountProfile> {
  const response = await api.get<AccountProfile>("/account/profile");

  return response.data;
}

export async function updateAccountProfile(
  request: UpdateAccountProfileRequest
): Promise<AccountProfile> {
  const response = await api.put<AccountProfile>(
    "/account/profile",
    request
  );

  return response.data;
}

export async function changeAccountPassword(
  request: ChangePasswordRequest
): Promise<void> {
  await api.put("/account/password", request);
}

export async function requestAccountEmailChange(
  request: RequestEmailChangeRequest
): Promise<EmailChangeChallenge> {
  const response = await api.post<EmailChangeChallenge>(
    "/account/email-change/request",
    request
  );

  return response.data;
}

export async function confirmAccountEmailChange(
  request: ConfirmEmailChangeRequest
): Promise<ConfirmEmailChangeResponse> {
  const response = await api.post<ConfirmEmailChangeResponse>(
    "/account/email-change/confirm",
    request
  );

  return response.data;
}
