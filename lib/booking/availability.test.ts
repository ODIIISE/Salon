import { describe, expect, it } from "vitest";
import { generateAvailability } from "./availability";

describe("availability engine", () => {
  const base = { schedule: { enabled: true, startsAt: "12:00", endsAt: "18:00" }, resolutionMinutes: 15, durationMinutes: 60, artistIds: ["artist-1"], bookings: [], blocks: [] };
  it("does not allow a service to finish after close by default", () => { const slots = generateAvailability(base); expect(slots.at(-1)?.startsAtMinutes).toBe(17 * 60); });
  it("allows only explicit capped overflow", () => { const slots = generateAvailability({ ...base, overflowMinutes: 60 }); expect(slots.at(-1)?.startsAtMinutes).toBe(17 * 60 + 45); });
  it("rejects overlapping bookings and global blocks", () => { const slots = generateAvailability({ ...base, bookings: [{ artistId: "artist-1", status: "confirmed", startsAt: new Date("1970-01-01T13:00:00Z"), endsAt: new Date("1970-01-01T14:00:00Z") }], blocks: [{ startsAt: new Date("1970-01-01T15:00:00Z"), endsAt: new Date("1970-01-01T16:00:00Z") }] }); expect(slots.some((s) => s.startsAtMinutes === 13 * 60)).toBe(false); expect(slots.some((s) => s.startsAtMinutes === 15 * 60)).toBe(false); });
  it("rejects a real Tehran appointment at the same local time", () => { const slots = generateAvailability({ ...base, bookings: [{ artistId: "artist-1", status: "confirmed", startsAt: new Date("2026-10-08T09:30:00Z"), endsAt: new Date("2026-10-08T10:30:00Z") }] }); expect(slots.some((s) => s.startsAtMinutes === 13 * 60)).toBe(false); });
  it("removes past slots plus lead time", () => { const slots = generateAvailability({ ...base, nowMinutes: 14 * 60, leadMinutes: 30 }); expect(slots[0]?.startsAtMinutes).toBe(14 * 60 + 30); });
});
