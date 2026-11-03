import { BarbersManager } from "@/components/admin/barbers-manager";
import { requireRole } from "@/lib/session";

export default async function AdminBarbersPage() {
  await requireRole("ADMIN");

  return <BarbersManager />;
}
