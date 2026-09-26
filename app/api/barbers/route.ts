import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBarbers, getBarberAvailability } from "@/lib/booking";

export async function GET(request: Request) {
  // Route: GET /api/barbers
  // Route: GET /api/barbers?barberId=<id>&date=YYYY-MM-DD&serviceId=<serviceId>
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get("barberId");
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (barberId && date && serviceId) {
    try {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { durationInMin: true },
      });

      if (!service || !service.durationInMin) {
        return NextResponse.json(
          { error: "Serviço inválido." },
          { status: 400 },
        );
      }

      const slots = await getBarberAvailability({
        barberId,
        date,
        serviceDurationMinutes: service.durationInMin,
      });

      return NextResponse.json({ barberId, date, slots });
    } catch (error) {
      console.error("Erro ao buscar disponibilidade do barbeiro:", error);
      return NextResponse.json(
        { error: "Erro ao consultar horários disponíveis." },
        { status: 500 },
      );
    }
  }

  try {
    const barbers = await getActiveBarbers();
    return NextResponse.json({ barbers });
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar barbeiros." },
      { status: 500 },
    );
  }
}
