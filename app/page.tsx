import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

function formatPrice(priceInCents: number) {
  return (priceInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function HomePage() {
  const [user, services] = await Promise.all([
    getCurrentUser(),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const isStaff = user?.role === "ADMIN" || user?.role === "BARBER";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="flex items-center justify-between gap-4 py-4">
        <span className="text-lg font-bold">BladeApp</span>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="opacity-70">{user.name}</span>
              {isStaff && (
                <Link href="/dashboard" className="underline">
                  Minha área
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="underline">
                Entrar
              </Link>
              <Link href="/register" className="underline">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-col gap-8 py-8">
        <section className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Agende seu horário</h1>
          <p className="opacity-70">
            Escolha o serviço, o barbeiro e o horário. Não é preciso criar conta.
          </p>
          <Link
            href="/agendar"
            className="w-fit rounded bg-blue-600 px-4 py-2 text-white"
          >
            Agendar
          </Link>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Serviços</h2>

          {services.length === 0 ? (
            <p className="opacity-70">Nenhum serviço disponível no momento.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between rounded border border-gray-700 p-3"
                >
                  <span>{service.name}</span>
                  <span className="text-sm opacity-70">
                    {formatPrice(service.priceInCents)} · {service.durationInMin} min
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
