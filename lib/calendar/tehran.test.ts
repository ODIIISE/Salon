import { describe, expect, it } from "vitest";
import { gregorianToJalali, jalaliDateLabel, tehranDateParts } from "./tehran";

describe("Tehran and Jalali boundaries", () => {
  it("converts the documented leap boundary", () => {
    expect(gregorianToJalali(2021, 3, 20)).toEqual({ year: 1399, month: 12, day: 30 });
    expect(gregorianToJalali(2021, 3, 21)).toEqual({ year: 1400, month: 1, day: 1 });
  });
  it("uses Tehran date around UTC midnight", () => {
    expect(tehranDateParts("2026-10-07T20:59:00.000Z").day).toBe(8);
    expect(jalaliDateLabel("2026-10-07T20:59:00.000Z")).toBe("1405/07/16");
  });
});
