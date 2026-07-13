export type ManualPaymentStatus =
  | "PENDING"
  | "PAID"
  | "REJECTED"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

export interface AdminManualPayment {
  id: number;
  studentId: number;
  studentEmail: string;
  studentFullName: string;
  courseId: number;
  courseTitle: string;
  amount: number;
  subtotalAmount: number;
  processingFeeAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: ManualPaymentStatus;
  provider: "MANUAL" | string;
  manualMethod: string | null;
  manualReference: string | null;
  manualProofUrl: string | null;
  manualProofResourceType: string | null;
  manualReviewedById: number | null;
  manualReviewedByEmail: string | null;
  manualReviewedAt: string | null;
  manualRejectionReason: string | null;
  createdAt: string;
  paidAt: string | null;
}
