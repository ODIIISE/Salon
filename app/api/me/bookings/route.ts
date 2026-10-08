import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { currentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, code: "UNAUTHENTICATED" }, { status: 401, headers: noStoreHeaders() });
  const result = await sql`SELECT id, starts_at, ends_at, status, service_name_snapshot, price_irr_snapshot FROM bookings WHERE customer_id = ${user.id} ORDER BY starts_at DESC LIMIT 50`;
  return NextResponse.json({ ok: true, bookings: result.rows }, { headers: noStoreHeaders() });
}
