import { db, sql, type VercelPoolClient } from "@vercel/postgres";
import { env } from "./env";

export { sql };

/**
 * The pooled `sql` tag may run each statement on a different connection,
 * so BEGIN/COMMIT through it is NOT a transaction. Every multi-statement
 * write must go through this helper, which pins one client for its lifetime.
 */
export async function withTransaction<T>(work: (client: VercelPoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.sql`BEGIN`;
    const result = await work(client);
    await client.sql`COMMIT`;
    return result;
  } catch (error) {
    await client.sql`ROLLBACK`.catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function databaseReady() {
  if (!env.POSTGRES_URL) return false;
  try {
    await sql`select 1 as ok`;
    return true;
  } catch {
    return false;
  }
}

export function noStoreHeaders() {
  return { "Cache-Control": "private, no-store, max-age=0" };
}
