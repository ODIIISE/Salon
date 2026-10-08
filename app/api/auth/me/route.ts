import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, code: "UNAUTHENTICATED" }, { status: 401 });
  return NextResponse.json({ ok: true, user });
}
