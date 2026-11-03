import { AppError } from "@/lib/api";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const barberSelect = {
  id: true,
  name: true,
  email: true,
  active: true,
} as const;

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readEmail(value: unknown) {
  return readText(value).toLowerCase();
}

async function ensureEmailAvailable(email: string, exceptUserId?: string) {
  const owner = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (owner && owner.id !== exceptUserId) {
    throw new AppError("Este e-mail já está em uso.", 409);
  }
}

async function findBarber(id: string) {
  const barber = await prisma.user.findFirst({
    where: { id, role: "BARBER" },
    select: { id: true },
  });

  if (!barber) {
    throw new AppError("Barbeiro não encontrado.", 404);
  }

  return barber;
}

export function listBarbers() {
  return prisma.user.findMany({
    where: { role: "BARBER" },
    orderBy: { name: "asc" },
    select: barberSelect,
  });
}

export async function createBarber(input: {
  name: unknown;
  email: unknown;
  password: unknown;
}) {
  const name = readText(input.name);
  const email = readEmail(input.email);
  const password = typeof input.password === "string" ? input.password : "";

  if (!name || !EMAIL_PATTERN.test(email)) {
    throw new AppError("Informe o nome e um e-mail válido.");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError("A senha inicial deve ter pelo menos 8 caracteres.");
  }

  await ensureEmailAvailable(email);

  // Sign-up goes through Better Auth so the password is stored hashed.
  const { user } = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  // Sign-up opens a session for the new account; the admin does not need it.
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: "BARBER" } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  return prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: barberSelect,
  });
}

export async function updateBarber(
  id: string,
  input: { name: unknown; email: unknown },
) {
  const name = readText(input.name);
  const email = readEmail(input.email);

  if (!name || !EMAIL_PATTERN.test(email)) {
    throw new AppError("Informe o nome e um e-mail válido.");
  }

  await findBarber(id);
  await ensureEmailAvailable(email, id);

  return prisma.user.update({
    where: { id },
    data: { name, email },
    select: barberSelect,
  });
}

export async function setBarberActive(id: string, active: boolean) {
  await findBarber(id);

  // Deactivation also ends any open session, so access stops immediately.
  const [barber] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { active },
      select: barberSelect,
    }),
    ...(active ? [] : [prisma.session.deleteMany({ where: { userId: id } })]),
  ]);

  return barber;
}
