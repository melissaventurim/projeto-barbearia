import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { formatShopTime, shopTimeToUtc } from "@/lib/timezone";

const OPENING_TIME = "10:00";
const CLOSING_TIME = "21:00";

export async function getActiveBarbers() {
  return prisma.user.findMany({
    where: {
      role: "BARBER",
      active: true,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
    },
  });
}

function toDateTime(date: string, time: string) {
  return shopTimeToUtc(date, time);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) {
  return startA < endB && endA > startB;
}

export async function getBarberAvailability({
  barberId,
  date,
  serviceDurationMinutes,
}: {
  barberId: string;
  date: string;
  serviceDurationMinutes: number;
}) {
  const startOfDay = shopTimeToUtc(date, "00:00");
  const endOfDay = shopTimeToUtc(date, "23:59");

  const openingAt = toDateTime(date, OPENING_TIME);
  const closingAt = toDateTime(date, CLOSING_TIME);

  const bookings = await prisma.booking.findMany({
    where: {
      barberId,
      status: { not: "CANCELLED" },
      startsAt: { lt: endOfDay },
      endsAt: { gt: startOfDay },
    },
    select: {
      startsAt: true,
      endsAt: true,
    },
  });

  const availabilityBlocks = await prisma.availability.findMany({
    where: {
      barberId,
      startsAt: { lt: endOfDay },
      endsAt: { gt: startOfDay },
    },
    select: {
      startsAt: true,
      endsAt: true,
    },
  });

  const candidateWindows = availabilityBlocks.length > 0 ? availabilityBlocks : [{
    startsAt: openingAt,
    endsAt: closingAt,
  }];

  const slots: string[] = [];
  const now = new Date();

  for (const block of candidateWindows) {
    const blockStart = new Date(Math.max(block.startsAt.getTime(), openingAt.getTime()));
    const blockEnd = new Date(Math.min(block.endsAt.getTime(), closingAt.getTime()));
    if (blockStart >= blockEnd) continue;

    const stepStart = new Date(blockStart);

    while (stepStart.getTime() + serviceDurationMinutes * 60 * 1000 <= blockEnd.getTime()) {
      const stepEnd = addMinutes(stepStart, serviceDurationMinutes);

      const hasBookingConflict = bookings.some((booking) =>
        overlaps(stepStart, stepEnd, booking.startsAt, booking.endsAt),
      );

      if (stepStart > now && !hasBookingConflict) {
        slots.push(formatShopTime(stepStart));
      }

      stepStart.setMinutes(stepStart.getMinutes() + 30);
    }
  }

  return [...new Set(slots)].sort((a, b) => {
    const [aHour, aMinute] = a.split(":").map(Number);
    const [bHour, bMinute] = b.split(":").map(Number);

    return aHour * 60 + aMinute - (bHour * 60 + bMinute);
  });
}

export async function createBooking({
  user,
  serviceId,
  barberId,
  date,
  time,
  clientName,
  clientPhone,
}: {
  user: {
    id: string;
    name: string;
    phone?: string | null;
  };
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  clientName?: string;
  clientPhone?: string;
}) {
  if (!serviceId || !barberId || !date || !time) {
    throw new Error("Dados do agendamento incompletos.");
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      active: true,
    },
  });

  if (!service) {
    throw new Error("Serviço não encontrado ou indisponível.");
  }

  const barber = await prisma.user.findFirst({
    where: {
      id: barberId,
      role: "BARBER",
      active: true,
    },
  });

  if (!barber) {
    throw new Error("Barbeiro não encontrado ou indisponível.");
  }

  const startsAt = toDateTime(date, time);
  const endsAt = addMinutes(startsAt, service.durationInMin);
  const openingAt = toDateTime(date, OPENING_TIME);
  const closingAt = toDateTime(date, CLOSING_TIME);

  if (
    Number.isNaN(startsAt.getTime()) ||
    startsAt < openingAt ||
    endsAt > closingAt ||
    startsAt <= new Date()
  ) {
    throw new Error("Horário inválido: o agendamento deve ocorrer entre 10h e 21h.");
  }

  const bookingConflict = await prisma.booking.findFirst({
    where: {
      barberId,
      status: { not: "CANCELLED" },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });

  if (bookingConflict) {
    throw new Error("Este horário já está ocupado para o barbeiro selecionado.");
  }

  const finalClientName = clientName?.trim() || user.name;
  const finalClientPhone = clientPhone?.trim() || user.phone || "";

  const bookingCode = crypto
    .createHash("sha256")
    .update(`${barberId}:${serviceId}:${startsAt.toISOString()}:${user.id}`)
    .digest("hex")
    .slice(0, 16);

  return prisma.booking.create({
    data: {
      serviceId,
      barberId,
      clientId: user.id,
      clientName: finalClientName,
      clientPhone: finalClientPhone,
      startsAt,
      endsAt,
      status: "CONFIRMED",
      codeHash: bookingCode,
    },
    include: {
      service: true,
      barber: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
