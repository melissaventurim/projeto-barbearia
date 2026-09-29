import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientBookings } from "@/components/client-bookings";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export default async function MyBookingsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/dashboard/meus-agendamentos");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "BARBER") redirect("/barber");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-4xl tracking-tight">
              Meus agendamentos
            </h1>
            <p className="mt-3 text-muted-foreground">
              Consulte seus horários e cancele agendamentos quando necessário.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Voltar para minha área</Link>
            </Button>
            <Button asChild>
              <Link href="/booking">Novo agendamento</Link>
            </Button>
          </div>
        </div>

        <ClientBookings />
      </main>
    </>
  );
}
