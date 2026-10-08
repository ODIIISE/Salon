import { endsByPolicy, overlaps, roundDuration, type BookingInterval } from "./policy";

export type ScheduleWindow = { enabled: boolean; startsAt: string; endsAt: string };
export type Candidate = { startsAtMinutes: number; endsAtMinutes: number; artistId: string; suggested: boolean };
export type AvailabilityInput = { schedule: ScheduleWindow; resolutionMinutes: number; durationMinutes: number; overflowMinutes?: number; leadMinutes?: number; nowMinutes?: number; artistIds: string[]; bookings: Array<BookingInterval & { artistId: string; status: string }>; blocks: Array<BookingInterval & { artistId?: string | null }> };

function minutes(value: string) { const [hours, mins] = value.split(":").map(Number); if (!Number.isInteger(hours) || !Number.isInteger(mins) || hours < 0 || hours > 23 || mins < 0 || mins > 59) throw new Error("Invalid time"); return hours * 60 + mins; }
function localMinutes(value: Date) { if (value.getUTCFullYear() === 1970) return value.getUTCHours() * 60 + value.getUTCMinutes(); const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value); return Number(parts.find((part) => part.type === "hour")?.value) * 60 + Number(parts.find((part) => part.type === "minute")?.value); }
function asInterval(startMinutes: number, endMinutes: number): BookingInterval { return { startsAt: new Date(startMinutes * 60_000), endsAt: new Date(endMinutes * 60_000) }; }

export function generateAvailability(input: AvailabilityInput) {
  if (!input.schedule.enabled || !input.artistIds.length) return [];
  const start = minutes(input.schedule.startsAt); const close = minutes(input.schedule.endsAt); const duration = roundDuration(input.durationMinutes, input.resolutionMinutes);
  const earliest = Math.max(start, input.nowMinutes === undefined ? start : input.nowMinutes + (input.leadMinutes ?? 0)); const first = Math.ceil(earliest / input.resolutionMinutes) * input.resolutionMinutes; const candidates: Candidate[] = [];
  for (let slot = first; slot < close; slot += input.resolutionMinutes) for (const artistId of input.artistIds) {
    const candidate = { startsAtMinutes: slot, endsAtMinutes: slot + duration, artistId, suggested: false }; if (!endsByPolicy(slot, duration, close, input.overflowMinutes ?? 0)) continue; const candidateInterval = asInterval(slot, slot + duration);
    if (input.bookings.filter((booking) => booking.artistId === artistId && ["reserved", "confirmed", "checked_in"].includes(booking.status)).some((booking) => overlaps(candidateInterval, asInterval(localMinutes(booking.startsAt), localMinutes(booking.endsAt))))) continue;
    if (input.blocks.some((block) => (!block.artistId || block.artistId === artistId) && overlaps(candidateInterval, asInterval(localMinutes(block.startsAt), localMinutes(block.endsAt))))) continue;
    candidates.push(candidate);
  }
  return candidates;
}
