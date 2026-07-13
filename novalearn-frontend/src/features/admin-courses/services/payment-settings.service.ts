import { api } from "@/lib/api";

import type {
  PaymentSettings,
  UpdatePaymentSettingsRequest,
} from "@/features/admin-courses/types/payment-settings.types";

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const response = await api.get<PaymentSettings>(
    "/admin/payments/settings"
  );

  return response.data;
}

export async function updatePaymentSettings(
  request: UpdatePaymentSettingsRequest
): Promise<PaymentSettings> {
  const response = await api.put<PaymentSettings>(
    "/admin/payments/settings",
    request
  );

  return response.data;
}
