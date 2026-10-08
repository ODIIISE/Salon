import { NextResponse } from "next/server";
import { databaseReady } from "@/lib/db";

export async function GET() {
  const database = await databaseReady();
  return NextResponse.json(
    {
      ok: true,
      service: "forehand-salon",
      version: "0.1.0",
      deployment: process.env.VERCEL_ENV ?? "local",
      database,
      state: database ? "foundation" : "needs-database",
    },
    { status: database ? 200 : 503 },
  );
}
