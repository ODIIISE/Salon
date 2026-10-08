export interface SmsProvider {
  sendOtp(input: { phoneE164: string; code: string }): Promise<void>;
  sendTransactional(input: { phoneE164: string; message: string }): Promise<void>;
}

export class MockSmsProvider implements SmsProvider {
  async sendOtp() { return; }
  async sendTransactional() { return; }
}

export function smsProvider(): SmsProvider {
  // Real provider adapters are selected here, never inside a route handler.
  return new MockSmsProvider();
}
