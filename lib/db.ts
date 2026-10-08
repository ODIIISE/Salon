import { sql } from "@vercel/postgres";
import { env } from "./env";

export { sql };

export async function databaseReady() {
  if (!env.POSTGRES_URL) return false;
  try {
    await sql`select 1 as ok`;
    return true;
  } catch {
    return false;
  }
}
