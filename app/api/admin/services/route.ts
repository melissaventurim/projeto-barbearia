
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 403 },
    );
  }

  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      durationInMin: true,
      active: true,
    },
  });

  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const name =
    typeof body?.name === "string" ? body.name.trim() : "";
  const price = Number(body?.price);
  const durationInMin = Number(body?.durationInMin);

  if (
    !name ||
    name.length > 80 ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 1000000 ||
    !Number.isInteger(durationInMin) ||
    durationInMin <= 0 ||
    durationInMin > 600
  ) {
    return NextResponse.json(
      { error: "Informe nome, preço maior que zero e duração válida." },
      { status: 400 },
    );
  }

  const service = await prisma.service.create({
    data: {
      name,
      priceInCents: Math.round(price * 100),
      durationInMin,
    },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      durationInMin: true,
      active: true,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json(
      { error: "Serviço inválido." },
      { status: 400 },
    );
  }

  const existing = await prisma.service.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Serviço não encontrado." },
      { status: 404 },
    );
  }

  // Ativar ou desativar um serviço.
  if (
    typeof body.active === "boolean" &&
    body.name === undefined &&
    body.price === undefined &&
    body.durationInMin === undefined
  ) {
    const service = await prisma.service.update({
      where: { id },
      data: { active: body.active },
      select: {
        id: true,
        name: true,
        priceInCents: true,
        durationInMin: true,
        active: true,
      },
    });

    return NextResponse.json({ service });
  }

  // Editar os dados de um serviço.
  const name =
    typeof body.name === "string" ? body.name.trim() : "";
  const price = Number(body.price);
  const durationInMin = Number(body.durationInMin);

  if (
    !name ||
    name.length > 80 ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 1000000 ||
    !Number.isInteger(durationInMin) ||
    durationInMin <= 0 ||
    durationInMin > 600
  ) {
    return NextResponse.json(
      { error: "Informe nome, preço maior que zero e duração válida." },
      { status: 400 },
    );
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      name,
      priceInCents: Math.round(price * 100),
      durationInMin,
    },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      durationInMin: true,
      active: true,
    },
  });

  return NextResponse.json({ service });
}
