import { AppError } from "@/lib/api";
import {
  CLOSING_TIME,
  OPENING_TIME,
  isDateString,
  isHalfHourTime,
  shopDate,
  shopDayRange,
} from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { shopTimeToUtc } from "@/lib/timezone";

type Interval = { startsAt: Date; endsAt: Date };

const periodSelect = { id: true, startsAt: true, endsAt: true } as const;

function mergeIntervals(intervals: Interval[]) {
  const sorted = [...intervals].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );
  const merged: Interval[] = [];

  for (const interval of sorted) {
    const last = merged.at(-1);

    if (last && interval.startsAt <= last.endsAt) {
      if (interval.endsAt > last.endsAt) last.endsAt = interval.endsAt;
    } else {
      merged.push({ ...interval });
    }
  }

  return merged;
}

/**
 * True when every booking fits entirely inside the given periods.
 */
export function bookingsFitPeriods(bookings: Interval[], periods: Interval[]) {
  const merged = mergeIntervals(periods);

  return bookings.every((booking) =>
    merged.some(
      (period) =>
        period.startsAt <= booking.startsAt && period.endsAt >= booking.endsAt,
    ),
  );
}

async function ensureBarber(barberId: string) {
  const barber = await prisma.user.findFirst({
    where: { id: barberId, role: "BARBER" },
    select: { id: true },
  });

  if (!barber) {
    throw new AppError("Barbeiro não encontrado.", 404);
  }
}

function confirmedBookingsOnDay(barberId: string, date: string) {
  const { start, end } = shopDayRange(date);

  return prisma.booking.findMany({
    where: {
      barberId,
      status: "CONFIRMED",
      startsAt: { gte: start, lt: end },
    },
    select: { startsAt: true, endsAt: true },
  });
}

export function listPeriods(barberId: string, date: string) {
  if (!barberId || !isDateString(date)) {
    throw new AppError("Informe o barbeiro e a data.");
  }

  const { start, end } = shopDayRange(date);

  return prisma.availability.findMany({
    where: { barberId, startsAt: { lt: end }, endsAt: { gt: start } },
    orderBy: { startsAt: "asc" },
    select: periodSelect,
  });
}

export async function createPeriod(input: {
  barberId: unknown;
  date: unknown;
  start: unknown;
  end: unknown;
}) {
  const { barberId, date, start, end } = input;

  if (typeof barberId !== "string" || !barberId || !isDateString(date)) {
    throw new AppError("Informe o barbeiro e a data.");
  }

  if (!isHalfHourTime(start) || !isHalfHourTime(end)) {
    throw new AppError("Informe início e fim em intervalos de 30 minutos.");
  }

  if (end <= start) {
    throw new AppError("O fim do período deve ser posterior ao início.");
  }

  if (start < OPENING_TIME || end > CLOSING_TIME) {
    throw new AppError("O período deve ficar entre 10:00 e 21:00.");
  }

  if (date < shopDate()) {
    throw new AppError("Não é possível cadastrar períodos em datas passadas.");
  }

  await ensureBarber(barberId);

  const period = {
    startsAt: shopTimeToUtc(date, start),
    endsAt: shopTimeToUtc(date, end),
  };
  const existing = await listPeriods(barberId, date);

  const overlapping = existing.some(
    (other) =>
      period.startsAt < other.endsAt && period.endsAt > other.startsAt,
  );

  if (overlapping) {
    throw new AppError("Este período se sobrepõe a outro já cadastrado.");
  }

  // Without periods the barber works the whole day; the first period narrows
  // it, so confirmed bookings must still fit in the new set of periods.
  const bookings = await confirmedBookingsOnDay(barberId, date);

  if (!bookingsFitPeriods(bookings, [...existing, period])) {
    throw new AppError(
      "Há reservas confirmadas que ficariam fora dos períodos de atendimento.",
    );
  }

  return prisma.availability.create({
    data: { barberId, ...period },
    select: periodSelect,
  });
}

export async function deletePeriod(id: unknown) {
  if (typeof id !== "string" || !id) {
    throw new AppError("Período inválido.");
  }

  const period = await prisma.availability.findUnique({
    where: { id },
    select: { id: true, barberId: true, startsAt: true },
  });

  if (!period) {
    throw new AppError("Período não encontrado.", 404);
  }

  const date = shopDate(period.startsAt);
  const remaining = (await listPeriods(period.barberId, date)).filter(
    (other) => other.id !== period.id,
  );

  // Removing the last period reopens the whole day, so only a partial removal
  // can leave a booking uncovered.
  if (remaining.length > 0) {
    const bookings = await confirmedBookingsOnDay(period.barberId, date);

    if (!bookingsFitPeriods(bookings, remaining)) {
      throw new AppError(
        "Há reservas confirmadas que ficariam fora dos períodos de atendimento.",
      );
    }
  }

  await prisma.availability.delete({ where: { id } });
}
