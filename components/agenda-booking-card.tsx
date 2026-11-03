import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatShopTime } from "@/lib/timezone";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type AgendaBooking = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  clientName: string;
  clientPhone: string;
  service: { name: string; durationInMin: number };
  barber: { id: string; name: string };
};

const statusLabel: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

export function AgendaBookingCard({
  booking,
  showBarber = false,
  children,
}: {
  booking: AgendaBooking;
  showBarber?: boolean;
  children?: ReactNode;
}) {
  const start = formatShopTime(new Date(booking.startsAt));
  const end = formatShopTime(new Date(booking.endsAt));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {start} às {end}
        </CardTitle>
        <CardDescription>{booking.service.name}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {showBarber && <Detail label="Barbeiro" value={booking.barber.name} />}
          <Detail label="Cliente" value={booking.clientName} />
          <Detail label="Telefone" value={booking.clientPhone || "-"} />
          <Detail label="Situação" value={statusLabel[booking.status]} />
        </div>

        {children}
      </CardContent>
    </Card>
  );
}
