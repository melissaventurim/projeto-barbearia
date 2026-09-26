import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";

export default async function BookingPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/booking");

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">
              Agendar atendimento
            </CardTitle>
            <CardDescription>
              Escolha o serviço, o barbeiro e o melhor horário disponível.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Olá, {user.name}. A tela de agendamento está sendo preparada para a seleção de serviço e agenda.
            </p>

            <Button asChild>
              <a href="/">Voltar para a página inicial</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
