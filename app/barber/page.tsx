import { BarberSchedule } from "@/components/barber-schedule";
import { SiteHeader } from "@/components/site-header";
import { requireRole } from "@/lib/session";

export default async function BarberPage() {
  await requireRole("BARBER");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-heading text-3xl tracking-tight">
          Agenda do barbeiro
        </h1>
        <p className="mt-4 text-muted-foreground">
          Acompanhe seus atendimentos e conclua os que já foram realizados.
        </p>

        <BarberSchedule />
      </main>
    </>
  );
}
