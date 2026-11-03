"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AgendaBookingCard,
  type AgendaBooking,
} from "@/components/agenda-booking-card";
import { BarberPicker, type BarberOption } from "@/components/admin/barber-picker";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shopDate } from "@/lib/dates";
import { errorMessage, requestJson } from "@/lib/request-json";

type BookingsResponse = { bookings: AgendaBooking[] };

function fetchDayBookings(date: string, barberId: string) {
  const params = new URLSearchParams({ date });
  if (barberId) params.set("barberId", barberId);

  return requestJson<BookingsResponse>(`/api/admin/bookings?${params}`);
}

export function AdminBookings() {
  const [date, setDate] = useState(() => shopDate());
  const [barberId, setBarberId] = useState("");
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [bookings, setBookings] = useState<AgendaBooking[]>([]);
  const [loading, setLoading] = useState(true);
  // Moment the list was loaded; decides which actions are still allowed.
  const [loadedAt, setLoadedAt] = useState(0);
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      requestJson<{ barbers: BarberOption[] }>("/api/admin/barbers"),
      fetchDayBookings(shopDate(), ""),
    ])
      .then(([barbersData, bookingsData]) => {
        if (!active) return;
        setBarbers(barbersData.barbers);
        setBookings(bookingsData.bookings);
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
      const data = await fetchDayBookings(date, barberId);
      setBookings(data.bookings);
      setLoadedAt(Date.now());
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao carregar a agenda."));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(booking: AgendaBooking) {
    const confirmed = window.confirm(
      `Cancelar o agendamento de ${booking.clientName}?`,
    );

    if (!confirmed) return;

    setCancellingId(booking.id);
    setMessage("");

    try {
      await requestJson("/api/admin/bookings", {
        method: "PATCH",
        body: { bookingId: booking.id },
      });

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id ? { ...item, status: "CANCELLED" } : item,
        ),
      );
      setMessage("Agendamento cancelado.");
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao cancelar o agendamento."));
    } finally {
      setCancellingId(null);
    }
  }


  return (
    <section className="mt-10 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Agenda geral</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Consulte os atendimentos de uma data e cancele reservas futuras.
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agenda-date">Data</Label>
          <Input
            id="agenda-date"
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="max-w-48"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Barbeiro</p>
          <BarberPicker
            barbers={barbers}
            value={barberId}
            onChange={setBarberId}
            allowAll
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
            <CardTitle>Nenhum agendamento nesta data</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {bookings.map((booking) => (
            <AgendaBookingCard key={booking.id} booking={booking} showBarber>
              {booking.status === "CONFIRMED" &&
                new Date(booking.startsAt).getTime() > loadedAt && (
                  <div>
                    <Button
                      variant="destructive"
                      onClick={() => void handleCancel(booking)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? "Cancelando..." : "Cancelar"}
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
