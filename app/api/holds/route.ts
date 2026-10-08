import { NextResponse } from "next/server";
import { noStoreHeaders, withTransaction } from "@/lib/db";
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

    const result = await withTransaction(async (tx) => {
      const service = await tx.sql`SELECT duration_minutes FROM services WHERE id = ${serviceId} AND salon_id = ${salonId} AND active = true LIMIT 1`;
      if (!service.rows.length) return { error: "SERVICE_NOT_FOUND" as const };

      const artist = requestedArtistId
        ? await tx.sql`SELECT a.id FROM artists a JOIN artist_services x ON x.artist_id = a.id AND x.service_id = ${serviceId} WHERE a.id = ${requestedArtistId} AND a.salon_id = ${salonId} AND a.active = true LIMIT 1`
        : await tx.sql`SELECT a.id FROM artists a JOIN artist_services x ON x.artist_id = a.id AND x.service_id = ${serviceId} WHERE a.salon_id = ${salonId} AND a.active = true ORDER BY a.id LIMIT 1`;
      if (!artist.rows.length) return { error: "NO_ELIGIBLE_ARTIST" as const };

      const artistId = artist.rows[0].id;
      const endsAt = new Date(startsAt.getTime() + Number(service.rows[0].duration_minutes) * 60_000);
      if (endsAt <= startsAt) throw new Error("INVALID_REQUEST");

      // Serialize availability decisions for this artist. The booking exclusion
      // constraint remains the final authority during finalization.
      await tx.sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${salonId}:${artistId}`}, 0))`;
      await tx.sql`DELETE FROM booking_holds WHERE expires_at <= now()`;
      const conflict = await tx.sql`
        SELECT 1 FROM bookings
        WHERE salon_id = ${salonId} AND artist_id = ${artistId}
          AND status IN ('reserved','confirmed','checked_in')
          AND starts_at < ${endsAt.toISOString()} AND ends_at > ${startsAt.toISOString()}
        UNION ALL
        SELECT 1 FROM booking_holds
        WHERE salon_id = ${salonId} AND artist_id = ${artistId}
          AND expires_at > now()
          AND starts_at < ${endsAt.toISOString()} AND ends_at > ${startsAt.toISOString()}
        LIMIT 1`;
      if (conflict.rows.length) return { error: "SLOT_CONFLICT" as const };

      const hold = await tx.sql`
        INSERT INTO booking_holds (salon_id, customer_id, artist_id, starts_at, ends_at, expires_at, selection)
        VALUES (${salonId}, ${user.id}, ${artistId}, ${startsAt.toISOString()}, ${endsAt.toISOString()}, now() + interval '5 minutes', ${JSON.stringify({ serviceId, ...body.selection })})
        RETURNING id, artist_id, starts_at, ends_at, expires_at`;
      return { hold: hold.rows[0] };
    });

    if ("error" in result) {
      const status = result.error === "SERVICE_NOT_FOUND" ? 404 : 409;
      return NextResponse.json({ ok: false, code: result.error }, { status, headers: noStoreHeaders() });
    }
    return NextResponse.json({ ok: true, hold: result.hold }, { status: 201, headers: noStoreHeaders() });
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() });
  }
}
