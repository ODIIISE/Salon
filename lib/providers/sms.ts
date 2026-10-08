export interface SmsProvider {
  sendOtp(input: { phoneE164: string; code: string }): Promise<void>;
  sendTransactional(input: { phoneE164: string; message: string }): Promise<void>;
}

export class MockSmsProvider implements SmsProvider {
  async sendOtp() { return; }
  async sendTransactional() { return; }
}

export class KavenegarSmsProvider implements SmsProvider {
  constructor(private readonly apiKey: string, private readonly sender?: string) {}
  private async send(phoneE164: string, message: string) {
    const response = await fetch(`https://api.kavenegar.com/v1/${this.apiKey}/sms/send.json`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ receptor: phoneE164, message, sender: this.sender ?? "" }), cache: "no-store" });
    if (!response.ok) throw new Error("SMS_PROVIDER_FAILED");
  }
  async sendOtp({ phoneE164, code }: { phoneE164: string; code: string }) { await this.send(phoneE164, `کد ورود فورهند: ${code}`); }
  async sendTransactional({ phoneE164, message }: { phoneE164: string; message: string }) { await this.send(phoneE164, message); }
}

export function smsProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER ?? "mock";
  if (provider === "kavenegar" && process.env.SMS_API_KEY) return new KavenegarSmsProvider(process.env.SMS_API_KEY, process.env.SMS_SENDER);
  return new MockSmsProvider();
}
