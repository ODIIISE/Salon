import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createSessionToken, hashSecret, secretsEqual } from "@/lib/auth/crypto";

function normalizePhone(value: unknown) {
  const phone = String(value ?? "").replace(/\s+/g, "");
  if (!/^\+98\d{10}$/.test(phone)) throw new Error("Invalid phone");
  return phone;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body.phone);
    const code = String(body.code ?? "");
    if (!/^\d{6}$/.test(code)) throw new Error("Invalid code");
    const result = await sql`SELECT id, code_hash, expires_at, attempts FROM otp_challenges WHERE phone_e164 = ${phone} AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1`;
    const challenge = result.rows[0];
    if (!challenge || new Date(challenge.expires_at) <= new Date() || Number(challenge.attempts) >= 5 || !secretsEqual(String(challenge.code_hash), hashSecret(code))) {
      if (challenge) await sql`UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ${challenge.id}`;
      return NextResponse.json({ ok: false, code: "OTP_INVALID" }, { status: 401 });
    }
    const user = await sql`INSERT INTO users (phone_e164) VALUES (${phone}) ON CONFLICT (phone_e164) DO UPDATE SET updated_at = now() RETURNING id`;
    const token = createSessionToken();
    await sql`UPDATE otp_challenges SET consumed_at = now() WHERE id = ${challenge.id}`;
    await sql`INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (${user.rows[0].id}, ${hashSecret(token)}, now() + interval '30 days')`;
    const response = NextResponse.json({ ok: true });
    response.cookies.set("forehand_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  }
}
