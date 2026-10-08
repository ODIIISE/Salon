import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createOtp, hashSecret } from "@/lib/auth/crypto";
import { smsProvider } from "@/lib/providers/sms";

function normalizePhone(value: unknown) {
  const phone = String(value ?? "").replace(/\s+/g, "");
  if (!/^\+98\d{10}$/.test(phone)) throw new Error("Invalid phone");
  return phone;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone);
    const code = createOtp();
    const hash = hashSecret(code);
    await sql`UPDATE otp_challenges SET consumed_at = now() WHERE phone_e164 = ${phone} AND consumed_at IS NULL`;
    await sql`INSERT INTO otp_challenges (phone_e164, code_hash, expires_at) VALUES (${phone}, ${hash}, now() + interval '3 minutes')`;
    await smsProvider().sendOtp({ phoneE164: phone, code });
    return NextResponse.json({ ok: true, expiresInSeconds: 180 });
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  }
}
