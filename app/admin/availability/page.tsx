import { AvailabilityManager } from "@/components/admin/availability-manager";
import { requireRole } from "@/lib/session";

export default async function AdminAvailabilityPage() {
  await requireRole("ADMIN");

  return <AvailabilityManager />;
}
