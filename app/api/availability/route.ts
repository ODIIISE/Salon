import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const salonId = url.searchParams.get("salonId");
  const date = url.searchParams.get("date");
  const serviceId = url.searchParams.get("serviceId");
  if (!salonId || !date || !serviceId) return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() });
  const result = await sql`SELECT id, artist_id, starts_at, ends_at FROM bookings WHERE salon_id = ${salonId} AND starts_at::date = ${date}::date AND status IN ('reserved','confirmed','checked_in') ORDER BY starts_at`;
  return NextResponse.json({ ok: true, salonId, date, serviceId, bookings: result.rows, slots: [], policy: { latestFinish: "strict" } }, { headers: noStoreHeaders() });
}
