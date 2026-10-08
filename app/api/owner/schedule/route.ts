import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { requireStaff } from "@/lib/auth/authorize";

export async function GET(request: Request) {
  const salonId = new URL(request.url).searchParams.get("salonId");
  if (!salonId) return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() });
  try { await requireStaff(salonId); const result = await sql`SELECT * FROM schedule_settings WHERE salon_id = ${salonId} LIMIT 1`; return NextResponse.json({ ok: true, settings: result.rows[0] ?? null }, { headers: noStoreHeaders() }); }
  catch (error) { const code = String(error).includes("FORBIDDEN") ? "FORBIDDEN" : "UNAUTHENTICATED"; return NextResponse.json({ ok: false, code }, { status: code === "FORBIDDEN" ? 403 : 401, headers: noStoreHeaders() }); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json(); const salonId = String(body.salonId ?? ""); await requireStaff(salonId, ["owner", "manager"]);
    const resolution = Number(body.resolutionMinutes ?? 15); const buffer = Number(body.bufferMinutes ?? 0); const lead = Number(body.leadMinutes ?? 0); const overflowEnabled = Boolean(body.overflowEnabled); const overflow = Number(body.overflowMinutes ?? 0);
    if (![5, 10, 15, 20, 30, 60].includes(resolution) || buffer < 0 || lead < 0 || overflow < 0 || (!overflowEnabled && overflow > 0)) return NextResponse.json({ ok: false, code: "INVALID_SETTINGS" }, { status: 400, headers: noStoreHeaders() });
    const result = await sql`INSERT INTO schedule_settings (salon_id, resolution_minutes, buffer_minutes, lead_minutes, overflow_enabled, overflow_minutes) VALUES (${salonId}, ${resolution}, ${buffer}, ${lead}, ${overflowEnabled}, ${overflow}) ON CONFLICT (salon_id) DO UPDATE SET resolution_minutes = excluded.resolution_minutes, buffer_minutes = excluded.buffer_minutes, lead_minutes = excluded.lead_minutes, overflow_enabled = excluded.overflow_enabled, overflow_minutes = excluded.overflow_minutes, updated_at = now() RETURNING *`;
    return NextResponse.json({ ok: true, settings: result.rows[0] }, { headers: noStoreHeaders() });
  } catch (error) { const code = String(error).includes("FORBIDDEN") ? "FORBIDDEN" : "UNAUTHENTICATED"; return NextResponse.json({ ok: false, code }, { status: code === "FORBIDDEN" ? 403 : 401, headers: noStoreHeaders() }); }
}
