"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AgendaBookingCard,
  type AgendaBooking,
} from "@/components/agenda-booking-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shopDate } from "@/lib/dates";
import { errorMessage, requestJson } from "@/lib/request-json";

function fetchSchedule(date: string) {
  const params = new URLSearchParams({ date });
  return requestJson<{ bookings: AgendaBooking[] }>(`/api/barber/bookings?${params}`);
}

export function BarberSchedule() {
  const [date, setDate] = useState(() => shopDate());
  const [bookings, setBookings] = useState<AgendaBooking[]>([]);
  const [loading, setLoading] = useState(true);
  // Moment the list was loaded; decides which actions are still allowed.
  const [loadedAt, setLoadedAt] = useState(0);
  const [message, setMessage] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchSchedule(shopDate())
      .then((data) => {
        if (!active) return;
        setBookings(data.bookings);
        setLoadedAt(Date.now());
      })
      .catch((error) => {
        if (active) setMessage(errorMessage(error, "Erro ao carregar a agenda."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await fetchSchedule(date);
      setBookings(data.bookings);
      setLoadedAt(Date.now());
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao carregar a agenda."));
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(booking: AgendaBooking) {
    if (!window.confirm(`Concluir o atendimento de ${booking.clientName}?`)) return;

    setCompletingId(booking.id);
    setMessage("");

    try {
      await requestJson("/api/barber/bookings", {
        method: "PATCH",
        body: { bookingId: booking.id },
      });

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id ? { ...item, status: "COMPLETED" } : item,
        ),
      );
      setMessage("Atendimento concluído.");
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao concluir o atendimento."));
    } finally {
      setCompletingId(null);
    }
  }


  return (
    <section className="mt-10 space-y-8">
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="schedule-date">Data</Label>
          <Input
            id="schedule-date"
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-48"
          />
        </div>

        <Button type="submit" disabled={loading}>
          Consultar
        </Button>
      </form>

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando agenda...</p>
      ) : bookings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum atendimento nesta data</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {bookings.map((booking) => (
            <AgendaBookingCard key={booking.id} booking={booking}>
              {booking.status === "CONFIRMED" &&
                new Date(booking.startsAt).getTime() <= loadedAt && (
                  <div>
                    <Button
                      onClick={() => void handleComplete(booking)}
                      disabled={completingId === booking.id}
                    >
                      {completingId === booking.id ? "Concluindo..." : "Concluir"}
                    </Button>
                  </div>
                )}
            </AgendaBookingCard>
          ))}
        </div>
      )}
    </section>
  );
}
