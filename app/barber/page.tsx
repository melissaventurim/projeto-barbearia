import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function BarberPage() {
  const user = await getCurrentUser();

  if (user?.role !== "BARBER") redirect("/login");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Agenda do barbeiro</h1>
      <p className="mt-2 text-sm opacity-70">
        Acompanhe os atendimentos do dia e confirme os já realizados.
      </p>
    </main>
  );
}
