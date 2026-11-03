import { AppError } from "@/lib/api";
import { isDateString, shopDayRange } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

const agendaSelect = {
  id: true,
  startsAt: true,
  endsAt: true,
  status: true,
  clientName: true,
  clientPhone: true,
  service: { select: { name: true, durationInMin: true } },
  barber: { select: { id: true, name: true } },
} as const;

export function listDayBookings({
  date,
  barberId,
}: {
  date: unknown;
  barberId?: string | null;
}) {
  if (!isDateString(date)) {
    throw new AppError("Informe uma data válida.");
  }

  const { start, end } = shopDayRange(date);

  return prisma.booking.findMany({
    where: {
      startsAt: { gte: start, lt: end },
      ...(barberId ? { barberId } : {}),
    },
    orderBy: { startsAt: "asc" },
    select: agendaSelect,
  });
}

export async function cancelBookingAsAdmin(bookingId: unknown) {
  if (typeof bookingId !== "string" || !bookingId) {
    throw new AppError("Agendamento inválido.");
  }

  // The previous status is part of the condition, so concurrent changes
  // cannot both succeed.
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, status: "CONFIRMED", startsAt: { gt: new Date() } },
    data: { status: "CANCELLED" },
  });

  if (result.count === 1) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { status: true },
  });

  if (!booking) {
    throw new AppError("Agendamento não encontrado.", 404);
  }

  if (booking.status !== "CONFIRMED") {
    throw new AppError("Este agendamento não pode mais ser cancelado.");
  }

  throw new AppError("Não é possível cancelar um agendamento que já começou.");
}
