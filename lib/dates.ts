import { SHOP_TIME_ZONE, shopTimeToUtc } from "@/lib/timezone";

export const OPENING_TIME = "10:00";
export const CLOSING_TIME = "21:00";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const HALF_HOUR_PATTERN = /^([01]\d|2[0-3]):(00|30)$/;

const shopDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SHOP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Returns the calendar date (YYYY-MM-DD) of an instant in the shop's time zone.
 */
export function shopDate(instant: Date = new Date()) {
  return shopDateFormatter.format(instant);
}

export function isDateString(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Accepts HH:mm times that fall on the half-hour grid used by the schedule.
 */
export function isHalfHourTime(value: unknown): value is string {
  return typeof value === "string" && HALF_HOUR_PATTERN.test(value);
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));

  return next.toISOString().slice(0, 10);
}

/**
 * UTC instants delimiting a whole day in the shop's time zone: [start, end).
 */
export function shopDayRange(date: string) {
  return {
    start: shopTimeToUtc(date, "00:00"),
    end: shopTimeToUtc(addDays(date, 1), "00:00"),
  };
}
