import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "forehand-salon",
    version: "0.1.0",
    deployment: process.env.VERCEL_ENV ?? "local",
    state: "foundation",
  });
}
