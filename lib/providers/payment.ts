export type PaymentIntent = { id: string; status: "pending" | "paid" | "failed"; redirectUrl?: string };
export interface PaymentProvider { createIntent(input: { amountIrr: number; bookingId: string; idempotencyKey: string }): Promise<PaymentIntent>; verifyWebhook(input: { rawBody: string; signature?: string }): Promise<{ providerReference: string; status: "paid" | "failed"; amountIrr: number; idempotencyKey: string }>; }
export class ManualPaymentProvider implements PaymentProvider { async createIntent() { throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED"); } async verifyWebhook() { throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED"); } }
export function paymentProvider(): PaymentProvider { return new ManualPaymentProvider(); }
