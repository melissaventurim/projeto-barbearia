import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SiteHeader } from "@/components/site-header";

export default async function BarberPage() {
  const user = await getCurrentUser();

  if (user?.role !== "BARBER") redirect("/login");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-heading text-3xl tracking-tight">
          Agenda do barbeiro
        </h1>
        <p className="mt-4 text-muted-foreground">
          Acompanhe os atendimentos do dia e confirme os já realizados.
        </p>
      </main>
    </>
  );
}
