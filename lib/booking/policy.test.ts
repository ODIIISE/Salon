import { describe, expect, it } from "vitest";
import { effectiveDuration, endsByPolicy, formulaSafeCell, overlaps, roundDuration } from "./policy";

describe("booking policy", () => {
  it("rounds service plus add-ons to the resolution", () => {
    expect(effectiveDuration(30, [10], 0, 15)).toBe(45);
    expect(effectiveDuration(30, [10], 15, 15)).toBe(60);
    expect(roundDuration(47, 15)).toBe(60);
  });

  it("enforces strict latest finish unless capped overflow is explicit", () => {
    expect(endsByPolicy(17 * 60 + 45, 60, 18 * 60, 0)).toBe(false);
    expect(endsByPolicy(17 * 60 + 45, 60, 18 * 60, 60)).toBe(true);
  });

  it("uses half-open intervals", () => {
    const atTen = new Date("2026-10-08T10:00:00+03:30");
    const atEleven = new Date("2026-10-08T11:00:00+03:30");
    const atTwelve = new Date("2026-10-08T12:00:00+03:30");
    expect(overlaps({ startsAt: atTen, endsAt: atEleven }, { startsAt: atEleven, endsAt: atTwelve })).toBe(false);
    expect(overlaps({ startsAt: atTen, endsAt: atTwelve }, { startsAt: atEleven, endsAt: atTwelve })).toBe(true);
  });

  it("neutralizes spreadsheet formulas", () => {
    expect(formulaSafeCell("=HYPERLINK(\"http://evil\",\"x\")")).toBe("'=HYPERLINK(\"http://evil\",\"x\")");
    expect(formulaSafeCell("مریم")).toBe("مریم");
  });
});
