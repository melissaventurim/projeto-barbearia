import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") redirect("/login");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Área do administrador</h1>
      <p className="mt-2 text-sm opacity-70">
        Cadastre serviços, barbeiros e horários de atendimento.
      </p>
    </main>
  );
}
