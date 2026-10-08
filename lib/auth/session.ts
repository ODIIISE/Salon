import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { hashSecret } from "./crypto";

export async function currentUser() {
  const token = (await cookies()).get("forehand_session")?.value;
  if (!token) return null;
  const result = await sql`SELECT u.id, u.phone_e164, u.display_name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ${hashSecret(token)} AND s.revoked_at IS NULL AND s.expires_at > now() LIMIT 1`;
  return result.rows[0] ?? null;
}

export async function revokeCurrentSession() {
  const token = (await cookies()).get("forehand_session")?.value;
  if (token) await sql`UPDATE sessions SET revoked_at = now() WHERE token_hash = ${hashSecret(token)} AND revoked_at IS NULL`;
}
