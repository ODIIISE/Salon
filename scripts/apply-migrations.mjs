import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { sql } from "@vercel/postgres";

const root = path.dirname(fileURLToPath(import.meta.url));
const migrationDir = path.join(root, "..", "db", "migrations");

await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

const files = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
for (const filename of files) {
  const contents = await readFile(path.join(migrationDir, filename), "utf8");
  const checksum = createHash("sha256").update(contents).digest("hex");
  const existing = await sql`SELECT checksum FROM schema_migrations WHERE filename = ${filename}`;
  if (existing.rows.length) {
    if (existing.rows[0].checksum !== checksum) throw new Error(`Migration checksum changed: ${filename}`);
    continue;
  }
  await sql.query("BEGIN");
  try {
    await sql.query(contents);
    await sql`INSERT INTO schema_migrations (filename, checksum) VALUES (${filename}, ${checksum})`;
    await sql.query("COMMIT");
    console.log(`Applied ${filename}`);
  } catch (error) {
    await sql.query("ROLLBACK");
    throw error;
  }
}
