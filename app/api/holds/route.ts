import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { currentUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, code: "UNAUTHENTICATED" }, { status: 401, headers: noStoreHeaders() });
  try {
    const body = await request.json();
    const salonId = String(body.salonId ?? "");
    const artistId = String(body.artistId ?? "");
    const startsAt = new Date(String(body.startsAt ?? ""));
    const endsAt = new Date(String(body.endsAt ?? ""));
    if (!salonId || !artistId || Number.isNaN(startsAt.valueOf()) || Number.isNaN(endsAt.valueOf()) || startsAt >= endsAt) throw new Error("INVALID_REQUEST");
    const existing = await sql`SELECT id FROM bookings WHERE salon_id = ${salonId} AND artist_id = ${artistId} AND status IN ('reserved','confirmed','checked_in') AND starts_at < ${endsAt.toISOString()} AND ends_at > ${startsAt.toISOString()} LIMIT 1`;
    if (existing.rows.length) return NextResponse.json({ ok: false, code: "SLOT_CONFLICT" }, { status: 409, headers: noStoreHeaders() });
    const hold = await sql`INSERT INTO booking_holds (salon_id, customer_id, artist_id, starts_at, ends_at, expires_at, selection) VALUES (${salonId}, ${user.id}, ${artistId}, ${startsAt.toISOString()}, ${endsAt.toISOString()}, now() + interval '5 minutes', ${JSON.stringify(body.selection ?? {})}) RETURNING id, expires_at`;
    return NextResponse.json({ ok: true, hold: hold.rows[0] }, { status: 201, headers: noStoreHeaders() });
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() });
  }
}
