const baseUrl = process.env.SMOKE_BASE_URL;
if (!baseUrl) throw new Error("SMOKE_BASE_URL is required");

const health = await fetch(`${baseUrl.replace(/\/$/, "")}/api/health`, { cache: "no-store" });
const payload = await health.json().catch(() => ({}));
if (!health.ok || !payload.ok || !payload.database) {
  throw new Error(`Health check failed: ${health.status}`);
}

console.log("Forehand smoke check passed");
