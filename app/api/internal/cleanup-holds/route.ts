import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!expected || provided !== expected) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const result = await sql`DELETE FROM booking_holds WHERE expires_at <= now() RETURNING id`;
  return NextResponse.json({ ok: true, released: result.rows.length });
}
