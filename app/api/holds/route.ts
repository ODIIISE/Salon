import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { currentUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, code: "UNAUTHENTICATED" }, { status: 401, headers: noStoreHeaders() });
  try {
    const body = await request.json();
    const salonId = String(body.salonId ?? "");
    const requestedArtistId = String(body.artistId ?? "");
    const serviceId = String(body.serviceId ?? "");
    const startsAt = new Date(String(body.startsAt ?? ""));
    if (!salonId || !serviceId || Number.isNaN(startsAt.valueOf())) throw new Error("INVALID_REQUEST");
    const service = await sql`SELECT duration_minutes FROM services WHERE id = ${serviceId} AND salon_id = ${salonId} AND active = true LIMIT 1`;
    if (!service.rows.length) return NextResponse.json({ ok: false, code: "SERVICE_NOT_FOUND" }, { status: 404, headers: noStoreHeaders() });
    const artist = requestedArtistId ? await sql`SELECT a.id FROM artists a JOIN artist_services x ON x.artist_id = a.id WHERE a.id = ${requestedArtistId} AND a.salon_id = ${salonId} AND a.active = true AND x.service_id = ${serviceId} LIMIT 1` : await sql`SELECT a.id FROM artists a JOIN artist_services x ON x.artist_id = a.id WHERE a.salon_id = ${salonId} AND a.active = true AND x.service_id = ${serviceId} ORDER BY a.id LIMIT 1`;
    if (!artist.rows.length) return NextResponse.json({ ok: false, code: "NO_ELIGIBLE_ARTIST" }, { status: 409, headers: noStoreHeaders() });
    const artistId = artist.rows[0].id;
    const endsAt = new Date(startsAt.getTime() + Number(service.rows[0].duration_minutes) * 60_000);
    const existing = await sql`SELECT id FROM bookings WHERE salon_id = ${salonId} AND artist_id = ${artistId} AND status IN ('reserved','confirmed','checked_in') AND starts_at < ${endsAt.toISOString()} AND ends_at > ${startsAt.toISOString()} LIMIT 1`;
    if (existing.rows.length) return NextResponse.json({ ok: false, code: "SLOT_CONFLICT" }, { status: 409, headers: noStoreHeaders() });
    const hold = await sql`INSERT INTO booking_holds (salon_id, customer_id, artist_id, starts_at, ends_at, expires_at, selection) VALUES (${salonId}, ${user.id}, ${artistId}, ${startsAt.toISOString()}, ${endsAt.toISOString()}, now() + interval '5 minutes', ${JSON.stringify({ serviceId, ...body.selection })}) RETURNING id, artist_id, starts_at, ends_at, expires_at`;
    return NextResponse.json({ ok: true, hold: hold.rows[0] }, { status: 201, headers: noStoreHeaders() });
  } catch { return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() }); }
}
