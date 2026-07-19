import { salonConfig } from "../config/salon.config.js";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function getTodayInSalonTimezone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: salonConfig.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getNowMinutesInSalonTimezone(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: salonConfig.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function weekdayForDate(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(y!, m! - 1, d!));
  return utc.getUTCDay();
}

export function isValidDateString(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isValidTimeString(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

export function computeEndTime(startTime: string, durationMinutes: number): string {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes);
}

export function generateCandidateSlots(durationMinutes: number): string[] {
  const open = timeToMinutes(salonConfig.openTime);
  const close = timeToMinutes(salonConfig.closeTime);
  const interval = salonConfig.slotIntervalMinutes;
  const slots: string[] = [];

  for (let start = open; start + durationMinutes <= close; start += interval) {
    slots.push(minutesToTime(start));
  }

  return slots;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
