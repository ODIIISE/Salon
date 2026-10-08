import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createOtp, hashSecret } from "@/lib/auth/crypto";
import { allowAuthRequest } from "@/lib/auth/rate-limit";
import { smsProvider } from "@/lib/providers/sms";

export async function POST(request: Request) {
  try {
    const body = await request.json(); const phone = String(body.phone ?? "").replace(/\s+/g, "");
    if (!/^\+98\d{10}$/.test(phone)) throw new Error("Invalid phone");
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!(await allowAuthRequest(`otp:phone:${phone}`, 3, 900)) || !(await allowAuthRequest(`otp:ip:${forwarded}`, 20, 900))) return NextResponse.json({ ok: false, code: "RATE_LIMITED" }, { status: 429 });
    const code = createOtp();
    await sql`UPDATE otp_challenges SET consumed_at = now() WHERE phone_e164 = ${phone} AND consumed_at IS NULL`;
    const inserted = await sql`INSERT INTO otp_challenges(phone_e164,code_hash,expires_at) VALUES(${phone},${hashSecret(code)},now()+interval '3 minutes') RETURNING id`;
    try { await smsProvider().sendOtp({ phoneE164: phone, code }); } catch { await sql`UPDATE otp_challenges SET consumed_at = now() WHERE id = ${inserted.rows[0].id}`; return NextResponse.json({ ok: false, code: "SMS_UNAVAILABLE" }, { status: 503 }); }
    return NextResponse.json({ ok: true, expiresInSeconds: 180 });
  } catch { return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 }); }
}
