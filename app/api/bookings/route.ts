import { NextResponse } from "next/server";
import { noStoreHeaders, withTransaction } from "@/lib/db";
import { currentUser } from "@/lib/auth/session";

type Outcome =
  | { kind: "created"; booking: Record<string, unknown> }
  | { kind: "replayed"; booking: Record<string, unknown> }
  | { kind: "expired" };

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStoreHeaders() });

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return json({ ok: false, code: "UNAUTHENTICATED" }, 401);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ ok: false, code: "INVALID_REQUEST" }, 400); }
  const holdId = String(body.holdId ?? "");
  const serviceId = String(body.serviceId ?? "");
  const idempotencyKey = String(body.idempotencyKey ?? request.headers.get("Idempotency-Key") ?? "").slice(0, 128);
  if (!holdId || !serviceId || !idempotencyKey) return json({ ok: false, code: "INVALID_REQUEST" }, 400);

  try {
    const outcome = await withTransaction<Outcome>(async (tx) => {
      const prior = await tx.sql`SELECT b.id, b.status, b.starts_at, b.ends_at FROM booking_requests r JOIN bookings b ON b.id = r.booking_id WHERE r.idempotency_key = ${idempotencyKey} AND r.customer_id = ${user.id}`;
      if (prior.rows.length) return { kind: "replayed", booking: prior.rows[0] };

      const hold = await tx.sql`SELECT h.*, s.name_fa, s.duration_minutes, s.price_irr, u.phone_e164 FROM booking_holds h JOIN services s ON s.id = ${serviceId} AND s.salon_id = h.salon_id JOIN users u ON u.id = h.customer_id WHERE h.id = ${holdId} AND h.customer_id = ${user.id} AND h.expires_at > now() FOR UPDATE OF h`;
      if (!hold.rows.length) return { kind: "expired" };
      const h = hold.rows[0];

      const booking = await tx.sql`INSERT INTO bookings (salon_id, customer_id, artist_id, service_id, starts_at, ends_at, status, service_name_snapshot, duration_minutes_snapshot, price_irr_snapshot) VALUES (${h.salon_id}, ${user.id}, ${h.artist_id}, ${serviceId}, ${h.starts_at}, ${h.ends_at}, 'reserved', ${h.name_fa}, ${h.duration_minutes}, ${h.price_irr}) RETURNING id, status, starts_at, ends_at`;
      const bookingId = booking.rows[0].id;
      await tx.sql`DELETE FROM booking_holds WHERE id = ${holdId}`;
      await tx.sql`INSERT INTO booking_requests (idempotency_key, salon_id, customer_id, booking_id) VALUES (${idempotencyKey}, ${h.salon_id}, ${user.id}, ${bookingId})`;
      await tx.sql`INSERT INTO booking_events (salon_id, booking_id, actor_id, event_type) VALUES (${h.salon_id}, ${bookingId}, ${user.id}, 'reserved')`;
      await tx.sql`INSERT INTO notification_jobs (salon_id, booking_id, channel, kind, recipient, payload) VALUES (${h.salon_id}, ${bookingId}, 'sms', 'confirmation', ${h.phone_e164}, ${JSON.stringify({ service: h.name_fa, startsAt: h.starts_at, endsAt: h.ends_at })})`;
      return { kind: "created", booking: booking.rows[0] };
    });

    if (outcome.kind === "expired") return json({ ok: false, code: "HOLD_EXPIRED" }, 410);
    if (outcome.kind === "replayed") return json({ ok: true, booking: outcome.booking, idempotent: true });
    return json({ ok: true, booking: outcome.booking }, 201);
  } catch (error) {
    const message = String(error);
    if (message.includes("bookings_no_overlap")) return json({ ok: false, code: "SLOT_CONFLICT" }, 409);
    if (message.includes("booking_requests_pkey")) return json({ ok: false, code: "IDEMPOTENCY_RETRY" }, 409);
    return json({ ok: false, code: "BOOKING_FAILED" }, 503);
  }
}
