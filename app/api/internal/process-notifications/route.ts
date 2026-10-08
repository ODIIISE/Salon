import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!expected || provided !== expected) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const claimed = await sql`UPDATE notification_jobs SET status = 'processing', attempts = attempts + 1 WHERE id IN (SELECT id FROM notification_jobs WHERE status = 'pending' AND next_attempt_at <= now() ORDER BY created_at LIMIT 25 FOR UPDATE SKIP LOCKED) RETURNING id`;
  for (const job of claimed.rows) await sql`UPDATE notification_jobs SET status = 'failed', last_error = 'provider_not_configured', next_attempt_at = now() + interval '15 minutes' WHERE id = ${job.id}`;
  return NextResponse.json({ ok: true, processed: claimed.rows.length });
}
