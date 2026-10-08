import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { generateAvailability } from "@/lib/booking/availability";
import { tehranDateParts } from "@/lib/calendar/tehran";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const salonId = url.searchParams.get("salonId"); const date = url.searchParams.get("date"); const serviceId = url.searchParams.get("serviceId");
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
    const day = tehranDateParts(`${date}T12:00:00+03:30`).weekday;
    const row = hours.rows.find((item) => Number(item.weekday) === day);
    const schedule = row ? { enabled: row.enabled, startsAt: String(row.starts_at).slice(0, 5), endsAt: String(row.ends_at).slice(0, 5) } : { enabled: false, startsAt: "00:00", endsAt: "00:00" };
    const slots = generateAvailability({ schedule, resolutionMinutes: 15, durationMinutes: Number(service.rows[0].duration_minutes), artistIds: artists.rows.map((item) => item.id), bookings: bookings.rows.map((item) => ({ ...item, startsAt: new Date(item.starts_at), endsAt: new Date(item.ends_at) })), blocks: blocks.rows.map((item) => ({ ...item, startsAt: new Date(item.starts_at), endsAt: new Date(item.ends_at) })) });
    return NextResponse.json({ ok: true, salonId, date, serviceId, slots, policy: { latestFinish: "strict", timezone: "Asia/Tehran", calendar: "jalali" } }, { headers: noStoreHeaders() });
  } catch { return NextResponse.json({ ok: false, code: "AVAILABILITY_UNAVAILABLE" }, { status: 503, headers: noStoreHeaders() }); }
}
