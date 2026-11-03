import { NextResponse } from "next/server";
import { errorResponse, forbiddenResponse, getUserWithRole } from "@/lib/api";
import { createPeriod, deletePeriod, listPeriods } from "@/lib/availability";

export async function GET(request: Request) {
  if (!(await getUserWithRole("ADMIN"))) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const periods = await listPeriods(
      searchParams.get("barberId") ?? "",
      searchParams.get("date") ?? "",
    );

    return NextResponse.json({ periods });
  } catch (error) {
    return errorResponse(error, "Não foi possível carregar os períodos.");
  }
}

export async function POST(request: Request) {
  if (!(await getUserWithRole("ADMIN"))) return forbiddenResponse();

  try {
    const body = await request.json().catch(() => null);
    const period = await createPeriod({
      barberId: body?.barberId,
      date: body?.date,
      start: body?.start,
      end: body?.end,
    });

    return NextResponse.json({ period }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Não foi possível cadastrar o período.");
  }
}

export async function DELETE(request: Request) {
  if (!(await getUserWithRole("ADMIN"))) return forbiddenResponse();

  try {
    const body = await request.json().catch(() => null);
    await deletePeriod(body?.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Não foi possível excluir o período.");
  }
}
