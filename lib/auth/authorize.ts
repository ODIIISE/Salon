import { sql } from "@/lib/db";
import { currentUser } from "./session";

export type StaffRole = "owner" | "manager" | "artist";

export async function requireStaff(salonId: string, roles: StaffRole[] = ["owner", "manager", "artist"]) {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  const result = await sql`SELECT role FROM memberships WHERE salon_id = ${salonId} AND user_id = ${user.id} LIMIT 1`;
  const role = result.rows[0]?.role as StaffRole | undefined;
  if (!role || !roles.includes(role)) throw new Error("FORBIDDEN");
  return { user, role };
}
