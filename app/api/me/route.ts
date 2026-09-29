import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  if (!user || !user.active) {
    return NextResponse.json(
      { error: "Usuário não encontrado ou inativo." },
      { status: 404 },
    );
  }

  return NextResponse.json({ user });
}
