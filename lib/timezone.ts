export const SHOP_TIME_ZONE = "America/Sao_Paulo";

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SHOP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Converts a wall-clock date and time in the shop's time zone into a UTC
 * instant, regardless of the server's own time zone.
 */
export function shopTimeToUtc(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  // Start from the naive UTC interpretation, then correct by the offset the
  // shop's time zone had at that moment.
  const naiveUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const offset = offsetAt(new Date(naiveUtc));

  return new Date(naiveUtc + offset);
}

/**
 * Formats an instant as HH:mm in the shop's time zone.
 */
export function formatShopTime(instant: Date) {
  const parts = dateTimeFormatter.formatToParts(instant);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
}

/**
 * Milliseconds to add to a naive-UTC reading to get the real UTC instant.
 */
function offsetAt(instant: Date) {
  const parts = dateTimeFormatter.formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    0,
    0,
  );

  return instant.getTime() - asUtc;
}
