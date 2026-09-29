import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthenticatedUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  const bookings = await prisma.booking.findMany({
    where: { clientId: userId },
    orderBy: { startsAt: "desc" },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      status: true,
      service: {
        select: {
          name: true,
          priceInCents: true,
          durationInMin: true,
        },
      },
      barber: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ bookings });
}

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const bookingId = body?.bookingId;

  if (typeof bookingId !== "string" || bookingId.length === 0) {
    return NextResponse.json(
      { error: "Agendamento inválido." },
      { status: 400 },
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      clientId: userId,
    },
    select: {
      id: true,
      status: true,
      startsAt: true,
    },
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Agendamento não encontrado." },
      { status: 404 },
    );
  }

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Este agendamento não pode mais ser cancelado." },
      { status: 400 },
    );
  }

  if (booking.startsAt <= new Date()) {
    return NextResponse.json(
      { error: "Não é possível cancelar um agendamento que já começou." },
      { status: 400 },
    );
  }

  const result = await prisma.booking.updateMany({
    where: {
      id: booking.id,
      clientId: userId,
      status: "CONFIRMED",
      startsAt: { gt: new Date() },
    },
    data: {
      status: "CANCELLED",
    },
  });

  if (result.count !== 1) {
    return NextResponse.json(
      { error: "O agendamento foi alterado e não pôde ser cancelado." },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true });
}
