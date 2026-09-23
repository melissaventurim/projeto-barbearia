import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage(): Promise<never> {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "BARBER") redirect("/barber");

  redirect("/");
}
