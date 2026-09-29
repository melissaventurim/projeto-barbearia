"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SHOP_TIME_ZONE } from "@/lib/timezone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

type Booking = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  service: {
    name: string;
    priceInCents: number;
    durationInMin: number;
  };
  barber: {
    name: string;
  };
};

const statusLabel: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
};

function formatPrice(priceInCents: number) {
  return (priceInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    timeZone: SHOP_TIME_ZONE,
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SHOP_TIME_ZONE,
  });
}

export function ClientBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/me/bookings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Não foi possível carregar os agendamentos.",
          );
        }

        return data;
      })
      .then((data) => {
        if (active) {
          setBookings(data.bookings ?? []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os agendamentos.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function cancelBooking(bookingId: string) {
    const confirmed = window.confirm(
      "Tem certeza de que deseja cancelar este agendamento?",
    );

    if (!confirmed) return;

    setError("");
    setCancellingId(bookingId);

    try {
      const response = await fetch("/api/me/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível cancelar o agendamento.");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "CANCELLED" as const }
            : booking,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cancelar o agendamento.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Carregando agendamentos...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <p className="text-destructive">{error}</p>}

      {bookings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum agendamento</CardTitle>
            <CardDescription>
              Você ainda não possui agendamentos vinculados a esta conta.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle>{booking.service.name}</CardTitle>
              <CardDescription>
                {formatDate(booking.startsAt)} às {formatTime(booking.startsAt)}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Barbeiro</p>
                  <p className="mt-1">{booking.barber.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="mt-1">{statusLabel[booking.status]}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="mt-1">{booking.service.durationInMin} min</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="mt-1">
                    {formatPrice(booking.service.priceInCents)}
                  </p>
                </div>
              </div>

              {booking.status === "CONFIRMED" && (
                <div>
                  <Button
                    variant="destructive"
                    onClick={() => void cancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id
                      ? "Cancelando..."
                      : "Cancelar agendamento"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
