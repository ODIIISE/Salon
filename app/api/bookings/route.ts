import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { currentUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, code: "UNAUTHENTICATED" }, { status: 401, headers: noStoreHeaders() });
  try {
    const body = await request.json(); const holdId = String(body.holdId ?? ""); const serviceId = String(body.serviceId ?? "");
    if (!holdId || !serviceId) throw new Error("INVALID_REQUEST");
    await sql.query("BEGIN");
    try {
      const hold = await sql`SELECT h.*, s.name_fa, s.duration_minutes, s.price_irr, u.phone_e164 FROM booking_holds h JOIN services s ON s.id = ${serviceId} AND s.salon_id = h.salon_id JOIN users u ON u.id = h.customer_id WHERE h.id = ${holdId} AND h.customer_id = ${user.id} AND h.expires_at > now() FOR UPDATE`;
      if (!hold.rows.length) { await sql.query("ROLLBACK"); return NextResponse.json({ ok: false, code: "HOLD_EXPIRED" }, { status: 410, headers: noStoreHeaders() }); }
      const h = hold.rows[0];
      const booking = await sql`INSERT INTO bookings (salon_id, customer_id, artist_id, service_id, starts_at, ends_at, status, service_name_snapshot, duration_minutes_snapshot, price_irr_snapshot) VALUES (${h.salon_id}, ${user.id}, ${h.artist_id}, ${serviceId}, ${h.starts_at}, ${h.ends_at}, 'reserved', ${h.name_fa}, ${h.duration_minutes}, ${h.price_irr}) RETURNING id, status, starts_at, ends_at`;
      await sql`DELETE FROM booking_holds WHERE id = ${holdId}`;
      await sql`INSERT INTO booking_events (salon_id, booking_id, actor_id, event_type) VALUES (${h.salon_id}, ${booking.rows[0].id}, ${user.id}, 'reserved')`;
      await sql`INSERT INTO notification_jobs (salon_id, booking_id, channel, kind, recipient, payload) VALUES (${h.salon_id}, ${booking.rows[0].id}, 'sms', 'confirmation', ${h.phone_e164}, ${JSON.stringify({ service: h.name_fa, startsAt: h.starts_at, endsAt: h.ends_at })})`;
      await sql.query("COMMIT");
      return NextResponse.json({ ok: true, booking: booking.rows[0] }, { status: 201, headers: noStoreHeaders() });
    } catch (error) {
      await sql.query("ROLLBACK");
      if (String(error).includes("bookings_no_overlap")) return NextResponse.json({ ok: false, code: "SLOT_CONFLICT" }, { status: 409, headers: noStoreHeaders() });
      throw error;
    }
  } catch { return NextResponse.json({ ok: false, code: "BOOKING_FAILED" }, { status: 503, headers: noStoreHeaders() }); }
}
