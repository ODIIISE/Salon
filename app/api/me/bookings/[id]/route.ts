import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { currentUser } from "@/lib/auth/session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, code: "UNAUTHENTICATED" }, { status: 401, headers: noStoreHeaders() });
  const { id } = await context.params;
  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    if (!["cancel"].includes(action)) return NextResponse.json({ ok: false, code: "UNSUPPORTED_ACTION" }, { status: 400, headers: noStoreHeaders() });
    const booking = await sql`SELECT id, salon_id, status, starts_at FROM bookings WHERE id = ${id} AND customer_id = ${user.id} LIMIT 1`;
    if (!booking.rows.length) return NextResponse.json({ ok: false, code: "BOOKING_NOT_FOUND" }, { status: 404, headers: noStoreHeaders() });
    const current = booking.rows[0];
    if (!["reserved", "confirmed"].includes(current.status)) return NextResponse.json({ ok: false, code: "BOOKING_NOT_CANCELLABLE" }, { status: 409, headers: noStoreHeaders() });
    if (new Date(current.starts_at).getTime() <= Date.now()) return NextResponse.json({ ok: false, code: "BOOKING_STARTED" }, { status: 409, headers: noStoreHeaders() });
    const updated = await sql`UPDATE bookings SET status = 'cancelled', updated_at = now() WHERE id = ${id} AND customer_id = ${user.id} AND status IN ('reserved','confirmed') RETURNING id, status`;
    await sql`INSERT INTO booking_events (salon_id, booking_id, actor_id, event_type, metadata) VALUES (${current.salon_id}, ${id}, ${user.id}, 'cancelled_by_customer', ${JSON.stringify({ reason: body.reason ?? "customer_request" })})`;
    return NextResponse.json({ ok: true, booking: updated.rows[0] }, { headers: noStoreHeaders() });
  } catch { return NextResponse.json({ ok: false, code: "BOOKING_UPDATE_FAILED" }, { status: 503, headers: noStoreHeaders() }); }
}
