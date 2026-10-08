import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireStaff } from "@/lib/auth/authorize";

function safe(value: unknown) { const text = String(value ?? ""); return /^[=+\-@]/.test(text) ? `'${text}` : text; }
function csvRow(values: unknown[]) { return values.map((value) => `"${safe(value).replaceAll('"', '""')}"`).join(","); }

export async function GET(request: Request) {
  const salonId = new URL(request.url).searchParams.get("salonId"); if (!salonId) return new NextResponse("invalid", { status: 400 });
  try {
    await requireStaff(salonId, ["owner", "manager"]);
    const result = await sql`SELECT b.id, b.starts_at, b.ends_at, b.status, b.service_name_snapshot, b.price_irr_snapshot, u.display_name FROM bookings b JOIN users u ON u.id = b.customer_id WHERE b.salon_id = ${salonId} ORDER BY b.starts_at DESC LIMIT 5000`;
    const rows = [csvRow(["id", "starts_at", "ends_at", "status", "service", "price_irr", "customer"]), ...result.rows.map((row) => csvRow([row.id, row.starts_at, row.ends_at, row.status, row.service_name_snapshot, row.price_irr_snapshot, row.display_name]))];
    return new NextResponse(rows.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=forehand-bookings.csv", "Cache-Control": "private, no-store" } });
  } catch { return new NextResponse("unauthorized", { status: 401 }); }
}
