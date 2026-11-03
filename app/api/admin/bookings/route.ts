import { NextResponse } from "next/server";
import { errorResponse, forbiddenResponse, getUserWithRole } from "@/lib/api";
import { cancelBookingAsAdmin, listDayBookings } from "@/lib/agenda";

export async function GET(request: Request) {
  if (!(await getUserWithRole("ADMIN"))) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const bookings = await listDayBookings({
      date: searchParams.get("date"),
      barberId: searchParams.get("barberId"),
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return errorResponse(error, "Não foi possível carregar a agenda.");
  }
}

export async function PATCH(request: Request) {
  if (!(await getUserWithRole("ADMIN"))) return forbiddenResponse();

  try {
    const body = await request.json().catch(() => null);
    await cancelBookingAsAdmin(body?.bookingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Não foi possível cancelar o agendamento.");
  }
}
