export type SmsSendResult = { providerMessageId?: string };
export interface SmsProvider { sendOtp(input: { phoneE164: string; code: string }): Promise<SmsSendResult>; sendTransactional(input: { phoneE164: string; message: string }): Promise<SmsSendResult>; }
function localPhone(phoneE164: string) { return phoneE164.replace(/^\+98/, "0"); }
export class MockSmsProvider implements SmsProvider { async sendOtp() { return {}; } async sendTransactional() { return {}; } }
export class FarazSmsProvider implements SmsProvider {
  constructor(private readonly apiKey: string, private readonly lineNumber: string, private readonly patternCode: string) {}
  private async post(path: string, body: Record<string, unknown>) { const response = await fetch(`https://api.iranpayamak.com${path}`, { method: "POST", headers: { "Api-Key": this.apiKey, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(`SMS_PROVIDER_FAILED:${response.status}`); return { providerMessageId: payload?.data?.id ?? payload?.id }; }
  async sendOtp(input: { phoneE164: string; code: string }) { return this.post("/ws/v1/sms/pattern", { code: this.patternCode, recipient: localPhone(input.phoneE164), attributes: { code: input.code }, line_number: this.lineNumber, number_format: "english" }); }
  async sendTransactional(input: { phoneE164: string; message: string }) { return this.post("/ws/v1/sms/simple", { text: input.message, recipients: [localPhone(input.phoneE164)], line_number: this.lineNumber, number_format: "english" }); }
}
export function smsProvider(): SmsProvider { if (process.env.SMS_PROVIDER === "farazsms" && process.env.SMS_API_KEY && process.env.SMS_LINE_NUMBER && process.env.SMS_PATTERN_CODE) return new FarazSmsProvider(process.env.SMS_API_KEY, process.env.SMS_LINE_NUMBER, process.env.SMS_PATTERN_CODE); return new MockSmsProvider(); }
