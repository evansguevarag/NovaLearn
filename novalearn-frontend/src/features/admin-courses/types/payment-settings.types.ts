export interface PaymentSettings {
  processingFeePercentage: number;
  processingFeeTaxPercentage: number;
  passProcessingFeeToStudent: boolean;
  culqiPaymentsEnabled: boolean;
  manualPaymentsEnabled: boolean;
}

export interface UpdatePaymentSettingsRequest {
  processingFeePercentage: number;
  passProcessingFeeToStudent: boolean;
  culqiPaymentsEnabled: boolean;
  manualPaymentsEnabled: boolean;
}
