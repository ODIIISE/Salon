import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { smsProvider } from "@/lib/providers/sms";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET; const provided = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!expected || provided !== expected) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const claimed = await sql`UPDATE notification_jobs SET status='processing', attempts=attempts+1 WHERE id IN (SELECT id FROM notification_jobs WHERE status='pending' AND next_attempt_at<=now() ORDER BY created_at LIMIT 25 FOR UPDATE SKIP LOCKED) RETURNING id, channel, kind, recipient, payload, attempts`;
  const provider = smsProvider(); let sent = 0; let failed = 0;
  for (const job of claimed.rows) {
    try {
      if (job.channel !== "sms") throw new Error("CHANNEL_NOT_CONFIGURED");
      const payload = job.payload ?? {}; const message = job.kind === "confirmation" ? `رزرو فورهند ثبت شد. خدمت: ${payload.service ?? ""}` : job.kind === "cancellation" ? "رزرو فورهند لغو شد." : `اطلاعیه فورهند: ${job.kind}`;
      const result = await provider.sendTransactional({ phoneE164: job.recipient, message });
      await sql`UPDATE notification_jobs SET status='sent', sent_at=now(), provider_message_id=${result.providerMessageId ?? null}, last_error=null WHERE id=${job.id}`; sent++;
    } catch (error) {
      const attempts = Number(job.attempts); const terminal = attempts >= 5;
      await sql`UPDATE notification_jobs SET status=${terminal ? "failed" : "pending"}, last_error=${String(error).slice(0, 240)}, next_attempt_at=now()+make_interval(mins => ${terminal ? 60 : Math.min(30, attempts * 5)}) WHERE id=${job.id}`; failed++;
    }
  }
  return NextResponse.json({ ok: true, processed: claimed.rows.length, sent, failed });
}
