import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { requireStaff } from "@/lib/auth/authorize";

export async function GET(request: Request) {
  const url = new URL(request.url); const salonId = url.searchParams.get("salonId"); const date = url.searchParams.get("date");
  if (!salonId || !date) return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() });
  try {
    await requireStaff(salonId);
    const result = await sql`SELECT b.id, b.starts_at, b.ends_at, b.status, b.service_name_snapshot, b.price_irr_snapshot, a.id AS artist_id, a.name AS artist_name, u.display_name AS customer_name FROM bookings b JOIN artists a ON a.id = b.artist_id JOIN users u ON u.id = b.customer_id WHERE b.salon_id = ${salonId} AND (b.starts_at AT TIME ZONE 'Asia/Tehran')::date = ${date}::date ORDER BY b.starts_at`;
    return NextResponse.json({ ok: true, date, bookings: result.rows }, { headers: noStoreHeaders() });
  } catch (error) { return NextResponse.json({ ok: false, code: String(error).includes("FORBIDDEN") ? "FORBIDDEN" : "UNAUTHENTICATED" }, { status: 401, headers: noStoreHeaders() }); }
}
