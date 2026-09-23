import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env");
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin já existe: ${email}`);
    return;
  }

  try {
    await auth.api.signUpEmail({
      body: { name: "Administrador", email, password },
    });
  } catch (error) {
    throw new Error(
      `Falha ao criar o admin (a senha precisa ter ao menos 8 caracteres): ${String(error)}`,
    );
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`Admin criado: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
