import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/dashboard");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "BARBER") redirect("/barber");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-heading text-4xl tracking-tight">Minha área</h1>
        <p className="mt-3 text-muted-foreground">
          Olá, {user.name}. Consulte seus dados e seus agendamentos.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Meus dados</CardTitle>
              <CardDescription>
                Consulte nome, e-mail, telefone e situação da sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/profile">Acessar meus dados</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meus agendamentos</CardTitle>
              <CardDescription>
                Veja seus horários e cancele um agendamento confirmado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/bookings">
                  Ver agendamentos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
