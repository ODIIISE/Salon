import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const databaseUrl = process.env.POSTGRES_URL;

describe.skipIf(!databaseUrl)("booking PostgreSQL integration", () => {
  it("prevents concurrent bookings for the same artist and interval", async () => {
    const { sql } = await import("@/lib/db");
    const salonId = randomUUID();
    const customerId = randomUUID();
    const artistId = randomUUID();
    const serviceId = randomUUID();
    const start = "2026-10-08T09:00:00.000Z";
    const end = "2026-10-08T10:00:00.000Z";

    await sql`INSERT INTO salons (id, name, slug) VALUES (${salonId}, 'Integration Salon', ${`integration-${salonId}`})`;
    await sql`INSERT INTO users (id, phone_e164) VALUES (${customerId}, ${`+989${salonId.replaceAll("-", "").slice(0, 9)}`})`;
    await sql`INSERT INTO artists (id, salon_id, name) VALUES (${artistId}, ${salonId}, 'Integration Artist')`;
    await sql`INSERT INTO services (id, salon_id, name_fa, duration_minutes, price_irr) VALUES (${serviceId}, ${salonId}, 'Integration Service', 60, 100)`;

    const insert = () => sql`
      INSERT INTO bookings (salon_id, customer_id, artist_id, service_id, starts_at, ends_at, status, service_name_snapshot, duration_minutes_snapshot, price_irr_snapshot)
      VALUES (${salonId}, ${customerId}, ${artistId}, ${serviceId}, ${start}, ${end}, 'reserved', 'Integration Service', 60, 100)
    `;
    const results = await Promise.allSettled([insert(), insert()]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);

    await sql`DELETE FROM salons WHERE id = ${salonId}`;
  });

  it("cleans expired holds and preserves a single idempotency request", async () => {
    const { sql } = await import("@/lib/db");
    const salonId = randomUUID();
    const customerId = randomUUID();
    const artistId = randomUUID();
    const key = `integration-${randomUUID()}`;

    await sql`INSERT INTO salons (id, name, slug) VALUES (${salonId}, 'Hold Salon', ${`hold-${salonId}`})`;
    await sql`INSERT INTO users (id, phone_e164) VALUES (${customerId}, ${`+988${salonId.replaceAll("-", "").slice(0, 9)}`})`;
    await sql`INSERT INTO artists (id, salon_id, name) VALUES (${artistId}, ${salonId}, 'Hold Artist')`;
    await sql`INSERT INTO booking_holds (salon_id, customer_id, artist_id, starts_at, ends_at, expires_at, selection) VALUES (${salonId}, ${customerId}, ${artistId}, now() - interval '2 hours', now() - interval '1 hour', now() - interval '1 minute', '{}')`;
    const expired = await sql`DELETE FROM booking_holds WHERE salon_id = ${salonId} AND expires_at <= now() RETURNING id`;
    expect(expired.rows).toHaveLength(1);

    await sql`INSERT INTO booking_requests (idempotency_key, salon_id, customer_id, booking_id) VALUES (${key}, ${salonId}, ${customerId}, NULL)`;
    await expect(sql`INSERT INTO booking_requests (idempotency_key, salon_id, customer_id, booking_id) VALUES (${key}, ${salonId}, ${customerId}, NULL)`).rejects.toThrow();

    await sql`DELETE FROM salons WHERE id = ${salonId}`;
  });

  it("treats Tehran-local and UTC representations as the same overlap", async () => {
    const { sql } = await import("@/lib/db");
    const result = await sql`
      SELECT tstzrange('2026-10-08 12:30:00+03:30'::timestamptz, '2026-10-08 13:30:00+03:30'::timestamptz, '[)')
        && tstzrange('2026-10-08 09:45:00Z'::timestamptz, '2026-10-08 10:15:00Z'::timestamptz, '[)') AS overlaps
    `;
    expect(result.rows[0].overlaps).toBe(true);
  });
});
