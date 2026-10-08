import { sql } from "@vercel/postgres";

const claimed = await sql`UPDATE notification_jobs SET status='processing', attempts=attempts+1 WHERE id IN (SELECT id FROM notification_jobs WHERE status='pending' AND next_attempt_at<=now() ORDER BY created_at LIMIT 25 FOR UPDATE SKIP LOCKED) RETURNING id, channel, kind, recipient, payload, attempts`;
for (const job of claimed.rows) {
  // The provider adapter is invoked by the deployment worker in the next wiring step.
  // Do not log recipient, payload, OTP, or customer notes.
  await sql`UPDATE notification_jobs SET status='failed', last_error='provider_not_configured', next_attempt_at=now()+interval '15 minutes' WHERE id=${job.id}`;
}
console.log(`Processed ${claimed.rows.length} notification jobs`);
