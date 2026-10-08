export type BookingInterval = { startsAt: Date; endsAt: Date };

export function roundDuration(durationMinutes: number, resolutionMinutes: number) {
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) throw new Error("Invalid duration");
  if (!Number.isInteger(resolutionMinutes) || resolutionMinutes <= 0) throw new Error("Invalid resolution");
  return Math.ceil(durationMinutes / resolutionMinutes) * resolutionMinutes;
}

export function effectiveDuration(serviceMinutes: number, addonMinutes: number[], bufferMinutes: number, resolutionMinutes: number) {
  const raw = serviceMinutes + addonMinutes.reduce((sum, minutes) => sum + minutes, 0) + bufferMinutes;
  return roundDuration(raw, resolutionMinutes);
}

export function endsByPolicy(startMinutes: number, durationMinutes: number, closeMinutes: number, overflowMinutes = 0) {
  if (startMinutes < 0 || durationMinutes <= 0 || closeMinutes <= 0 || overflowMinutes < 0) return false;
  return startMinutes + durationMinutes <= closeMinutes + overflowMinutes;
}

export function overlaps(a: BookingInterval, b: BookingInterval) {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

export function formulaSafeCell(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}
