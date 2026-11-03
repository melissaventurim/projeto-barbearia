import { AdminBookings } from "@/components/admin/admin-bookings";
import { requireRole } from "@/lib/session";

export default async function AdminAgendaPage() {
  await requireRole("ADMIN");

  return <AdminBookings />;
}
