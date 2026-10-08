import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const salonId = new URL(request.url).searchParams.get("salonId");
  if (!salonId) return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  try {
    const [services, addons] = await Promise.all([
      sql`SELECT id, name_fa AS name, description_fa AS detail, duration_minutes, price_irr FROM services WHERE salon_id = ${salonId} AND active = true ORDER BY created_at`,
      sql`SELECT id, name_fa AS name, duration_minutes, price_irr FROM addons WHERE salon_id = ${salonId} AND active = true ORDER BY name_fa`,
    ]);
    return NextResponse.json({ ok: true, services: services.rows, addons: addons.rows }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ ok: false, code: "CATALOG_UNAVAILABLE" }, { status: 503 });
  }
}
