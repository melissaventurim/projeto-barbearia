import { ServicesManager } from "@/components/admin/services-manager";
import { requireRole } from "@/lib/session";

export default async function AdminServicesPage() {
  await requireRole("ADMIN");

  return <ServicesManager />;
}
