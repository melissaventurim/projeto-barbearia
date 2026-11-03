import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";

export default async function AdminPage() {
  await requireRole("ADMIN");

  redirect("/admin/services");
}
