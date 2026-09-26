"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Service = {
  id: string;
  name: string;
  priceInCents: number;
  durationInMin: number;
};

type Barber = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
};

const TIME_SLOTS = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00"
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatPrice(priceInCents: number) {
  return (priceInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function BookingForm({
  services,
  userName,
}: {
  services: Service[];
  userName: string;
}) {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id ?? "");
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    addDays(new Date(), 1).toISOString().slice(0, 10),
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [selectedServiceId, services],
  );

  const availableDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(new Date(), index + 1));
  }, []);

  useEffect(() => {
    if (!success) return;

    const redirectTimeout = window.setTimeout(() => router.push("/"), 3000);
    return () => window.clearTimeout(redirectTimeout);
  }, [router, success]);

  useEffect(() => {
    async function loadBarbers() {
      try {
        const response = await fetch("/api/barbers");
        const payload = (await response.json()) as { barbers?: Barber[] };
        const nextBarbers = payload.barbers ?? [];
        setBarbers(nextBarbers);

        if (nextBarbers[0]) {
          setSelectedBarberId(nextBarbers[0].id);
        }
      } catch {
        setError("Não foi possível carregar os barbeiros.");
      } finally {
        setIsLoadingBarbers(false);
      }
    }

    void loadBarbers();
  }, []);

  useEffect(() => {
    if (!selectedBarberId || !selectedDate || !selectedServiceId) {
      setAvailableSlots([]);
      setSelectedSlot("");
      return;
    }

    async function loadAvailability() {
      setIsLoadingSlots(true);
      setError("");

      try {
        const response = await fetch(
          `/api/barbers?barberId=${selectedBarberId}&date=${selectedDate}&serviceId=${selectedServiceId}`,
        );

        const payload = (await response.json()) as {
          slots?: string[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Não foi possível carregar os horários.");
        }

        const nextSlots = payload.slots ?? [];
        setAvailableSlots(nextSlots);
        setSelectedSlot(nextSlots[0] ?? "");
      } catch (loadError) {
        setAvailableSlots([]);
        setSelectedSlot("");
        setError(
          loadError instanceof Error ? loadError.message : "Erro ao carregar horários.",
        );
      } finally {
        setIsLoadingSlots(false);
      }
    }

    void loadAvailability();
  }, [selectedBarberId, selectedDate, selectedServiceId]);

  const summary = useMemo(() => {
    if (!selectedService) return null;

    const serviceDate = new Date(`${selectedDate}T00:00:00`);
    const barber = barbers.find((item) => item.id === selectedBarberId);
    const selectedTime = selectedSlot || "";

    return {
      service: selectedService,
      barber,
      date: formatDateLabel(serviceDate),
      time: selectedTime,
    };
  }, [barbers, selectedBarberId, selectedDate, selectedService, selectedSlot]);

  async function handleSubmit() {
    if (!selectedService || !selectedBarberId || !selectedDate || !selectedSlot) {
      setError("Preencha todos os campos para confirmar o agendamento.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          barberId: selectedBarberId,
          date: selectedDate,
          time: selectedSlot,
        }),
      });

      const payload = (await response.json()) as { error?: string; booking?: unknown };

      if (!response.ok) {
        throw new Error(payload.error ?? "Não foi possível confirmar o agendamento.");
      }

      setSuccess("Agendamento confirmado com sucesso!");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Erro ao confirmar agendamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-3xl tracking-tight">
            Agendar atendimento
          </CardTitle>
          <CardDescription>
            Escolha o serviço, o dia, o barbeiro e o horário ideal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-heading text-xl tracking-tight">Serviço</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={[
                      "rounded-xl border p-4 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {service.durationInMin} min
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {formatPrice(service.priceInCents)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-xl tracking-tight">Dia</h2>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {availableDates.map((date) => {
                const isoDate = date.toISOString().slice(0, 10);
                const isSelected = selectedDate === isoDate;

                return (
                  <button
                    key={isoDate}
                    type="button"
                    onClick={() => setSelectedDate(isoDate)}
                    className={[
                      "rounded-xl border p-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/60",
                    ].join(" ")}
                  >
                    <div className="text-sm uppercase tracking-wide text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date)}
                    </div>
                    <div className="mt-2 font-medium">
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      }).format(date)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-xl tracking-tight">Barbeiro</h2>
            {isLoadingBarbers ? (
              <p className="text-sm text-muted-foreground">Carregando barbeiros...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {barbers.map((barber) => {
                  const isSelected = selectedBarberId === barber.id;

                  return (
                    <button
                      key={barber.id}
                      type="button"
                      onClick={() => setSelectedBarberId(barber.id)}
                      className={[
                        "rounded-xl border p-4 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/60",
                      ].join(" ")}
                    >
                      <div className="font-medium">{barber.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">Disponível</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-xl tracking-tight">Horário</h2>
            {isLoadingSlots ? (
              <p className="text-sm text-muted-foreground">Buscando horários disponíveis...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-4">
                {TIME_SLOTS.map((slot) => {
                  const isAvailable = availableSlots.includes(slot);
                  const isSelected = selectedSlot === slot && isAvailable;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSlot(slot);
                        }
                      }}
                      className={[
                        "rounded-xl border p-3 transition-colors",
                        isAvailable
                          ? isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/60"
                          : "border-border bg-muted/30 text-muted-foreground opacity-40 grayscale",
                      ].join(" ")}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">
            Resumo
          </CardTitle>
          <CardDescription>
            {userName}, confirme os detalhes antes de finalizar.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {summary ? (
            <>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground">Serviço</div>
                <div className="mt-1 font-medium">{summary.service.name}</div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground">Barbeiro</div>
                <div className="mt-1 font-medium">{summary.barber?.name ?? "Selecionar"}</div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground">Data e horário</div>
                <div className="mt-1 font-medium">
                  {summary.date}
                  {summary.time ? ` · ${summary.time}` : ""}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">Total</span>
                <span className="font-heading text-2xl tracking-tight">
                  {formatPrice(summary.service.priceInCents)}
                </span>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={() => void handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? "Confirmando..." : "Confirmar agendamento"}
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Selecione um serviço para continuar.</p>
          )}
        </CardContent>
      </Card>

      {success && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section
            aria-labelledby="booking-success-title"
            aria-modal="true"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            role="dialog"
          >
            <div className="h-1.5 bg-primary" />
            <div className="p-7 text-center sm:p-8">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <Check aria-hidden="true" className="size-8" strokeWidth={2.5} />
              </div>
              <p className="mt-5 text-sm font-medium text-primary">Agendamento realizado</p>
              <h2
                className="mt-2 font-heading text-2xl tracking-tight"
                id="booking-success-title"
              >
                Tudo certo, {userName}!
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Seu horário foi confirmado. Estamos esperando por você.
              </p>

              <div className="mt-6 space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-left">
                <p className="font-medium">{summary.service.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                  <span>{summary.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 aria-hidden="true" className="size-4 text-primary" />
                  <span>{summary.time} · {summary.barber?.name}</span>
                </div>
              </div>

              <div
                aria-label="Redirecionando para o início em 3 segundos"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={0}
                className="mt-6 h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
              >
                <div className="booking-success-progress h-full rounded-full bg-primary" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Você será redirecionado para o início em instantes.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
