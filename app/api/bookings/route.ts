import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBooking } from "@/lib/booking";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, barberId, date, time, clientName, clientPhone } = body ?? {};

    const booking = await createBooking({
      user: {
        id: session.user.id,
        name: session.user.name,
        phone: session.user.phone ?? null,
      },
      serviceId,
      barberId,
      date,
      time,
      clientName,
      clientPhone,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar agendamento.";

    const status =
      message.includes("incompletos") ||
      message.includes("não encontrado") ||
      message.includes("inválido")
        ? 400
        : message.includes("ocupado")
          ? 409
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
