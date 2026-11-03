import { NextResponse } from "next/server";
import {
  AppError,
  errorResponse,
  forbiddenResponse,
  getUserWithRole,
} from "@/lib/api";
import {
  createBarber,
  listBarbers,
  setBarberActive,
  updateBarber,
} from "@/lib/barbers";

export async function GET() {
  if (!(await getUserWithRole("ADMIN"))) return forbiddenResponse();

  const barbers = await listBarbers();
  return NextResponse.json({ barbers });
}

export async function POST(request: Request) {
  if (!(await getUserWithRole("ADMIN"))) return forbiddenResponse();

  try {
    const body = await request.json().catch(() => null);
    const barber = await createBarber({
      name: body?.name,
      email: body?.email,
      password: body?.password,
    });

    return NextResponse.json({ barber }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Não foi possível cadastrar o barbeiro.");
  }
}

export async function PATCH(request: Request) {
  if (!(await getUserWithRole("ADMIN"))) return forbiddenResponse();

  try {
    const body = await request.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";

    if (!id) throw new AppError("Barbeiro inválido.");

    const barber =
      typeof body.active === "boolean"
        ? await setBarberActive(id, body.active)
        : await updateBarber(id, { name: body.name, email: body.email });

    return NextResponse.json({ barber });
  } catch (error) {
    return errorResponse(error, "Não foi possível alterar o barbeiro.");
  }
}
