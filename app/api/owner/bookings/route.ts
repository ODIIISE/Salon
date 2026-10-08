import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { requireStaff } from "@/lib/auth/authorize";

export async function POST(request: Request) {
  try {
    const body = await request.json(); const salonId = String(body.salonId ?? ""); const { user, role } = await requireStaff(salonId, ["owner", "manager"]);
    const artistId = String(body.artistId ?? ""); const serviceId = String(body.serviceId ?? ""); const startsAt = new Date(String(body.startsAt ?? "")); const endsAt = new Date(String(body.endsAt ?? "")); const override = Boolean(body.overrideConflict); const reason = String(body.overrideReason ?? "");
    if (!artistId || !serviceId || Number.isNaN(startsAt.valueOf()) || Number.isNaN(endsAt.valueOf()) || startsAt >= endsAt) return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() });
    const conflict = await sql`SELECT id FROM bookings WHERE salon_id = ${salonId} AND artist_id = ${artistId} AND status IN ('reserved','confirmed','checked_in') AND starts_at < ${endsAt.toISOString()} AND ends_at > ${startsAt.toISOString()} LIMIT 1`;
    if (conflict.rows.length && !override) return NextResponse.json({ ok: false, code: "CONFLICT_REQUIRES_CONFIRMATION" }, { status: 409, headers: noStoreHeaders() });
    if (conflict.rows.length && (!reason || role !== "owner")) return NextResponse.json({ ok: false, code: "OVERRIDE_NOT_ALLOWED" }, { status: 403, headers: noStoreHeaders() });
    const customerId = body.customerId ? String(body.customerId) : user.id;
    const service = await sql`SELECT name_fa, duration_minutes, price_irr FROM services WHERE id = ${serviceId} AND salon_id = ${salonId} LIMIT 1`;
    if (!service.rows.length) return NextResponse.json({ ok: false, code: "SERVICE_NOT_FOUND" }, { status: 404, headers: noStoreHeaders() });
    const s = service.rows[0];
    const booking = await sql`INSERT INTO bookings(salon_id,customer_id,artist_id,service_id,starts_at,ends_at,status,service_name_snapshot,duration_minutes_snapshot,price_irr_snapshot) VALUES(${salonId},${customerId},${artistId},${serviceId},${startsAt.toISOString()},${endsAt.toISOString()},'reserved',${s.name_fa},${s.duration_minutes},${s.price_irr}) RETURNING id,status,starts_at,ends_at`;
    await sql`INSERT INTO booking_events(salon_id,booking_id,actor_id,event_type,metadata) VALUES(${salonId},${booking.rows[0].id},${user.id},'manual_booking_created',${JSON.stringify({override,reason})})`;
    await sql`INSERT INTO audit_logs(salon_id,actor_id,action,entity_type,entity_id,metadata) VALUES(${salonId},${user.id},'manual_booking_created','booking',${booking.rows[0].id},${JSON.stringify({override,reason})})`;
    return NextResponse.json({ ok: true, booking: booking.rows[0] }, { status: 201, headers: noStoreHeaders() });
  } catch (error) { if (String(error).includes("bookings_no_overlap")) return NextResponse.json({ ok: false, code: "SLOT_CONFLICT" }, { status: 409, headers: noStoreHeaders() }); return NextResponse.json({ ok: false, code: "MANUAL_BOOKING_FAILED" }, { status: 503, headers: noStoreHeaders() }); }
}
