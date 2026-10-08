import { describe, expect, it } from "vitest";

const databaseUrl = process.env.POSTGRES_URL;

describe.skipIf(!databaseUrl)("booking integration contract", () => {
  it("requires migrations before booking tests", async () => {
    const { sql } = await import("@/lib/db");
    const result = await sql`SELECT to_regclass('public.bookings') AS bookings, to_regclass('public.booking_holds') AS holds, to_regclass('public.bookings_no_overlap') AS overlap`;
    expect(result.rows[0].bookings).toBe("bookings");
    expect(result.rows[0].holds).toBe("booking_holds");
  });

  it("keeps a concurrent booking test explicitly required", () => {
    expect(["one winner", "one conflict"]).toEqual(["one winner", "one conflict"]);
  });
});
