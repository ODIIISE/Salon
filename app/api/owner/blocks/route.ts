import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { requireStaff } from "@/lib/auth/authorize";

export async function GET(request: Request) {
  const salonId = new URL(request.url).searchParams.get("salonId"); if (!salonId) return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  try { await requireStaff(salonId); const result = await sql`SELECT id, artist_id, starts_at, ends_at, reason FROM blocks WHERE salon_id = ${salonId} ORDER BY starts_at DESC LIMIT 200`; return NextResponse.json({ ok: true, blocks: result.rows }, { headers: noStoreHeaders() }); } catch { return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 }); }
}

export async function POST(request: Request) {
  try { const body = await request.json(); const salonId = String(body.salonId ?? ""); const { user } = await requireStaff(salonId, ["owner", "manager", "artist"]); const startsAt = new Date(String(body.startsAt ?? "")); const endsAt = new Date(String(body.endsAt ?? "")); if (Number.isNaN(startsAt.valueOf()) || Number.isNaN(endsAt.valueOf()) || startsAt >= endsAt) return NextResponse.json({ ok: false, code: "INVALID_TIME" }, { status: 400 }); const result = await sql`INSERT INTO blocks (salon_id, artist_id, starts_at, ends_at, reason) VALUES (${salonId}, ${body.artistId || null}, ${startsAt.toISOString()}, ${endsAt.toISOString()}, ${String(body.reason ?? "")}) RETURNING *`; return NextResponse.json({ ok: true, block: result.rows[0], actorId: user.id }, { status: 201, headers: noStoreHeaders() }); } catch { return NextResponse.json({ ok: false, code: "BLOCK_CREATE_FAILED" }, { status: 503 }); }
}
