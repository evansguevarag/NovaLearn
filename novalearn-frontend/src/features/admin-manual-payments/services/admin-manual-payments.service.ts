import { api } from "@/lib/api";

import type {
  AdminManualPayment,
  ManualPaymentStatus,
} from "@/features/admin-manual-payments/types/admin-manual-payments.types";

export async function getAdminManualPayments(
  status?: ManualPaymentStatus | "ALL"
): Promise<AdminManualPayment[]> {
  const response = await api.get<AdminManualPayment[]>(
    "/admin/payments/manual",
    {
      params:
        status && status !== "ALL"
          ? {
              status,
            }
          : undefined,
    }
  );

  return response.data;
}

export async function approveAdminManualPayment(
  paymentId: number
): Promise<AdminManualPayment> {
  const response = await api.post<AdminManualPayment>(
    `/admin/payments/${paymentId}/manual/approve`
  );

  return response.data;
}

export async function rejectAdminManualPayment(
  paymentId: number,
  reason: string
): Promise<AdminManualPayment> {
  const response = await api.post<AdminManualPayment>(
    `/admin/payments/${paymentId}/manual/reject`,
    {
      reason,
    }
  );

  return response.data;
}
