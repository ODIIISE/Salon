import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { requireStaff } from "@/lib/auth/authorize";

const allowed = ["reserved", "confirmed", "checked_in", "completed", "cancelled", "no_show"] as const;
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await request.json(); const salonId = String(body.salonId ?? ""); const status = String(body.status ?? "");
    if (!salonId || !allowed.includes(status as typeof allowed[number])) return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: noStoreHeaders() });
    const { user } = await requireStaff(salonId);
    const updated = await sql`UPDATE bookings SET status = ${status}, updated_at = now() WHERE id = ${id} AND salon_id = ${salonId} RETURNING id, status`;
    if (!updated.rows.length) return NextResponse.json({ ok: false, code: "BOOKING_NOT_FOUND" }, { status: 404, headers: noStoreHeaders() });
    await sql`INSERT INTO booking_events (salon_id, booking_id, actor_id, event_type, metadata) VALUES (${salonId}, ${id}, ${user.id}, 'status_changed', ${JSON.stringify({ status })})`;
    return NextResponse.json({ ok: true, booking: updated.rows[0] }, { headers: noStoreHeaders() });
  } catch (error) { const code = String(error).includes("FORBIDDEN") ? "FORBIDDEN" : "UNAUTHENTICATED"; return NextResponse.json({ ok: false, code }, { status: code === "FORBIDDEN" ? 403 : 401, headers: noStoreHeaders() }); }
}
