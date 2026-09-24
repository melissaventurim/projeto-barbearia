import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SiteHeader } from "@/components/site-header";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") redirect("/login");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-heading text-3xl tracking-tight">
          Área do administrador
        </h1>
        <p className="mt-4 text-muted-foreground">
          Cadastre serviços, barbeiros e horários de atendimento.
        </p>
      </main>
    </>
  );
}
