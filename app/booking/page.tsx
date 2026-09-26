import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";
import { getActiveServices } from "@/lib/services";
import { BookingForm } from "@/components/booking-form";

export default async function BookingPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/booking");

  const services = await getActiveServices();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <BookingForm services={services} userName={user.name} />
      </main>
    </>
  );
}
