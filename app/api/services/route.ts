import { NextResponse } from "next/server";
import { getActiveServices } from "@/lib/services";

export async function GET() {
  try {
    const services = await getActiveServices();

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);

    return NextResponse.json(
      { error: "Erro ao buscar serviços." },
      { status: 500 },
    );
  }
}
