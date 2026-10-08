import { sql } from "@/lib/db";

export async function allowAuthRequest(key: string, maxRequests: number, windowSeconds: number) {
  const result = await sql`INSERT INTO auth_rate_limits (key, window_started_at, request_count) VALUES (${key}, now(), 1) ON CONFLICT (key) DO UPDATE SET request_count = CASE WHEN auth_rate_limits.window_started_at <= now() - make_interval(secs => ${windowSeconds}) THEN 1 ELSE auth_rate_limits.request_count + 1 END, window_started_at = CASE WHEN auth_rate_limits.window_started_at <= now() - make_interval(secs => ${windowSeconds}) THEN now() ELSE auth_rate_limits.window_started_at END RETURNING request_count`;
  return Number(result.rows[0]?.request_count ?? maxRequests + 1) <= maxRequests;
}
