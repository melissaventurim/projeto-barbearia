import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientProfile } from "@/components/client-profile";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export default async function MyDataPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/dashboard/meus-dados");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "BARBER") redirect("/barber");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-4xl tracking-tight">Meus dados</h1>
            <p className="mt-3 text-muted-foreground">
              Consulte os dados cadastrados na sua conta.
            </p>
          </div>

          <div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Voltar para minha área</Link>
            </Button>
          </div>
        </div>

        <ClientProfile />
      </main>
    </>
  );
}
