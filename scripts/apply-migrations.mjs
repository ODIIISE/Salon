import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createClient } from "@vercel/postgres";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const connectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
if (!connectionString) throw new Error("POSTGRES_URL or POSTGRES_URL_NON_POOLING is required");

const client = createClient({ connectionString });
await client.connect();
try {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const filename of files) {
    const contents = await readFile(path.join(dir, filename), "utf8");
    const checksum = createHash("sha256").update(contents).digest("hex");
    const existing = await client.query("SELECT checksum FROM schema_migrations WHERE filename = $1", [filename]);
    if (existing.rows.length) {
      if (existing.rows[0].checksum !== checksum) throw new Error(`Migration checksum changed: ${filename}. Never edit applied migrations; add a new one.`);
      continue;
    }
    await client.query("BEGIN");
    try {
      await client.query(contents);
      await client.query("INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)", [filename, checksum]);
      await client.query("COMMIT");
      console.log(`Applied ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client.end();
}
