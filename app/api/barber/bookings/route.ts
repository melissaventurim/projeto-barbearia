import { NextResponse } from "next/server";
import { errorResponse, forbiddenResponse, getUserWithRole } from "@/lib/api";
import { completeBooking, listDayBookings } from "@/lib/agenda";

export async function GET(request: Request) {
  const barber = await getUserWithRole("BARBER");
  if (!barber) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);

    // The barber always comes from the session, never from the request.
    const bookings = await listDayBookings({
      date: searchParams.get("date"),
      barberId: barber.id,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return errorResponse(error, "Não foi possível carregar a agenda.");
  }
}

export async function PATCH(request: Request) {
  const barber = await getUserWithRole("BARBER");
  if (!barber) return forbiddenResponse();

  try {
    const body = await request.json().catch(() => null);
    await completeBooking(body?.bookingId, barber.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Não foi possível concluir o atendimento.");
  }
}
