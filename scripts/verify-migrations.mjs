import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();
if (!files.length) throw new Error("No migrations found");
for (const file of files) {
  const body = await readFile(path.join(dir, file), "utf8");
  if (!body.trim()) throw new Error(`Empty migration: ${file}`);
  const checksum = createHash("sha256").update(body).digest("hex");
  console.log(`${file} ${checksum}`);
}
