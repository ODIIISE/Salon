import { sql } from "@vercel/postgres";

const jobs = await sql`SELECT id, channel, kind, recipient, payload, attempts FROM notification_jobs WHERE status = 'pending' AND next_attempt_at <= now() ORDER BY created_at LIMIT 25 FOR UPDATE SKIP LOCKED`;
for (const job of jobs.rows) {
  await sql`UPDATE notification_jobs SET status = 'processing', attempts = attempts + 1 WHERE id = ${job.id}`;
  // Provider adapter integration belongs here. Never log recipient, payload, OTP, or customer notes.
  await sql`UPDATE notification_jobs SET status = 'failed', last_error = 'provider_not_configured', next_attempt_at = now() + interval '15 minutes' WHERE id = ${job.id}`;
}
console.log(`Processed ${jobs.rows.length} notification jobs`);
