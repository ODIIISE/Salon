export interface SmsProvider {
  sendOtp(input: { phoneE164: string; code: string }): Promise<void>;
  sendTransactional(input: { phoneE164: string; message: string }): Promise<void>;
}

function localPhone(phoneE164: string) {
  return phoneE164.replace(/^\+98/, "0");
}

export class MockSmsProvider implements SmsProvider {
  async sendOtp() { return; }
  async sendTransactional() { return; }
}

export class FarazSmsProvider implements SmsProvider {
  constructor(private readonly apiKey: string, private readonly lineNumber: string, private readonly patternCode: string) {}
  private async sendPattern(phoneE164: string, code: string) {
    const response = await fetch("https://api.iranpayamak.com/ws/v1/sms/pattern", { method: "POST", headers: { "Api-Key": this.apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ code: this.patternCode, recipient: localPhone(phoneE164), attributes: { code }, line_number: this.lineNumber, number_format: "english" }), cache: "no-store" });
    if (!response.ok) throw new Error("SMS_PROVIDER_FAILED");
  }
  private async sendSimple(phoneE164: string, message: string) {
    const response = await fetch("https://api.iranpayamak.com/ws/v1/sms/simple", { method: "POST", headers: { "Api-Key": this.apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ text: message, recipients: [localPhone(phoneE164)], line_number: this.lineNumber, number_format: "english" }), cache: "no-store" });
    if (!response.ok) throw new Error("SMS_PROVIDER_FAILED");
  }
  async sendOtp(input: { phoneE164: string; code: string }) { await this.sendPattern(input.phoneE164, input.code); }
  async sendTransactional(input: { phoneE164: string; message: string }) { await this.sendSimple(input.phoneE164, input.message); }
}

export function smsProvider(): SmsProvider {
  if (process.env.SMS_PROVIDER === "farazsms" && process.env.SMS_API_KEY && process.env.SMS_LINE_NUMBER && process.env.SMS_PATTERN_CODE) return new FarazSmsProvider(process.env.SMS_API_KEY, process.env.SMS_LINE_NUMBER, process.env.SMS_PATTERN_CODE);
  return new MockSmsProvider();
}
