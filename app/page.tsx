import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

function formatPrice(priceInCents: number) {
  return (priceInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function HomePage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <section className="flex flex-col items-start">
          <h1 className="font-heading text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Agende seu horário
          </h1>
          <p className="mt-5 max-w-lg text-muted-foreground">
            Escolha o serviço, o barbeiro e o horário. Não é preciso criar conta.
          </p>
          <Button asChild size="lg" className="mt-8 px-8">
            <Link href="/agendar">Agendar</Link>
          </Button>
        </section>

        <section className="mt-20">
          <h2 className="font-heading text-2xl tracking-tight">Serviços</h2>

          {services.length === 0 ? (
            <p className="mt-6 text-muted-foreground">
              Nenhum serviço disponível no momento.
            </p>
          ) : (
            <ul className="mt-6 border-t border-border">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-4"
                >
                  <span>{service.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(service.priceInCents)} · {service.durationInMin} min
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
