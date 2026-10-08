import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { generateAvailability } from "@/lib/booking/availability";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const salonId = url.searchParams.get("salonId");
  const date = url.searchParams.get("date");
  const serviceId = url.searchParams.get("serviceId");
  if (!salonId || !date || !serviceId) return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() });
  try {
    const [service, hours, artists, bookings, blocks] = await Promise.all([
      sql`SELECT duration_minutes FROM services WHERE id = ${serviceId} AND salon_id = ${salonId} AND active = true LIMIT 1`,
      sql`SELECT weekday, enabled, starts_at, ends_at FROM working_hours WHERE salon_id = ${salonId}`,
      sql`SELECT id FROM artists WHERE salon_id = ${salonId} AND active = true`,
      sql`SELECT artist_id, starts_at, ends_at, status FROM bookings WHERE salon_id = ${salonId} AND starts_at::date = ${date}::date`,
      sql`SELECT artist_id, starts_at, ends_at FROM blocks WHERE salon_id = ${salonId} AND starts_at::date = ${date}::date`,
    ]);
    if (!service.rows.length) return NextResponse.json({ ok: false, code: "SERVICE_NOT_FOUND" }, { status: 404, headers: noStoreHeaders() });
    const day = new Date(`${date}T12:00:00+03:30`).getDay();
    const schedule = hours.rows.find((row) => Number(row.weekday) === day);
    const availability = generateAvailability({ schedule: schedule ? { enabled: schedule.enabled, startsAt: String(schedule.starts_at).slice(0, 5), endsAt: String(schedule.ends_at).slice(0, 5) } : { enabled: false, startsAt: "00:00", endsAt: "00:00" }, resolutionMinutes: 15, durationMinutes: Number(service.rows[0].duration_minutes), artistIds: artists.rows.map((row) => row.id), bookings: bookings.rows.map((row) => ({ ...row, startsAt: new Date(row.starts_at), endsAt: new Date(row.ends_at) })), blocks: blocks.rows.map((row) => ({ ...row, startsAt: new Date(row.starts_at), endsAt: new Date(row.ends_at) })) });
    return NextResponse.json({ ok: true, salonId, date, serviceId, slots: availability, policy: { latestFinish: "strict", timezone: "Asia/Tehran" } }, { headers: noStoreHeaders() });
  } catch {
    return NextResponse.json({ ok: false, code: "AVAILABILITY_UNAVAILABLE" }, { status: 503, headers: noStoreHeaders() });
  }
}
