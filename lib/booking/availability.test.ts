import { describe, expect, it } from "vitest";
import { generateAvailability } from "./availability";

describe("availability engine", () => {
  const base = { schedule: { enabled: true, startsAt: "12:00", endsAt: "18:00" }, resolutionMinutes: 15, durationMinutes: 60, artistIds: ["artist-1"], bookings: [], blocks: [] };
  it("does not allow a service to finish after close by default", () => {
    const slots = generateAvailability(base);
    expect(slots.at(-1)?.startsAtMinutes).toBe(17 * 60);
  });
  it("allows only explicit capped overflow", () => {
    const slots = generateAvailability({ ...base, overflowMinutes: 60 });
    expect(slots.at(-1)?.startsAtMinutes).toBe(17 * 60 + 45);
  });
  it("rejects overlapping bookings and global blocks", () => {
    const start = new Date(13 * 60 * 60_000);
    const end = new Date(14 * 60 * 60_000);
    const slots = generateAvailability({ ...base, bookings: [{ artistId: "artist-1", status: "confirmed", startsAt: start, endsAt: end }], blocks: [{ startsAt: new Date(15 * 60 * 60_000), endsAt: new Date(16 * 60 * 60_000) }] });
    expect(slots.some((s) => s.startsAtMinutes === 13 * 60)).toBe(false);
    expect(slots.some((s) => s.startsAtMinutes === 15 * 60)).toBe(false);
  });
  it("removes past slots plus lead time", () => {
    const slots = generateAvailability({ ...base, nowMinutes: 14 * 60, leadMinutes: 30 });
    expect(slots[0]?.startsAtMinutes).toBe(14 * 60 + 30);
  });
});
