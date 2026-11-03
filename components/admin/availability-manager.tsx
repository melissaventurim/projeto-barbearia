"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BarberPicker, type BarberOption } from "@/components/admin/barber-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLOSING_TIME, OPENING_TIME, shopDate } from "@/lib/dates";
import { errorMessage, requestJson } from "@/lib/request-json";
import { formatShopTime } from "@/lib/timezone";

type Period = { id: string; startsAt: string; endsAt: string };

function fetchPeriods(barberId: string, date: string) {
  const params = new URLSearchParams({ barberId, date });
  return requestJson<{ periods: Period[] }>(`/api/admin/availability?${params}`);
}

export function AvailabilityManager() {
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState(() => shopDate());
  const [periods, setPeriods] = useState<Period[]>([]);
  const [form, setForm] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    requestJson<{ barbers: BarberOption[] }>("/api/admin/barbers")
      .then(async (data) => {
        const first = data.barbers.find((barber) => barber.active) ?? data.barbers[0];
        const periodsData = first ? await fetchPeriods(first.id, shopDate()) : null;

        if (!active) return;
        setBarbers(data.barbers);
        setBarberId(first?.id ?? "");
        setPeriods(periodsData?.periods ?? []);
      })
      .catch((error) => {
        if (active) setMessage(errorMessage(error, "Erro ao carregar os horários."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function loadPeriods(nextBarberId: string, nextDate: string) {
    if (!nextBarberId || !nextDate) return;

    setLoading(true);

    try {
      const data = await fetchPeriods(nextBarberId, nextDate);
      setPeriods(data.periods);
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao carregar os horários."));
    } finally {
      setLoading(false);
    }
  }

  function handleBarberChange(nextBarberId: string) {
    setBarberId(nextBarberId);
    setMessage("");
    void loadPeriods(nextBarberId, date);
  }

  function handleDateChange(nextDate: string) {
    setDate(nextDate);
    setMessage("");
    void loadPeriods(barberId, nextDate);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await requestJson("/api/admin/availability", {
        method: "POST",
        body: { barberId, date, start: form.start, end: form.end },
      });
      setForm({ start: "", end: "" });
      setMessage("Período cadastrado.");
      await loadPeriods(barberId, date);
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao cadastrar o período."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(period: Period) {
    if (!window.confirm("Excluir este período de atendimento?")) return;

    setMessage("");

    try {
      await requestJson("/api/admin/availability", {
        method: "DELETE",
        body: { id: period.id },
      });
      setMessage("Período excluído.");
      await loadPeriods(barberId, date);
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao excluir o período."));
    }
  }

  return (
    <section className="mt-10 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Horários de atendimento
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sem períodos cadastrados, o barbeiro atende das {OPENING_TIME} às{" "}
          {CLOSING_TIME}. Com períodos, só esses horários ficam disponíveis no dia.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Barbeiro</p>
          {barbers.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground">
              Cadastre um barbeiro antes de definir horários.
            </p>
          ) : (
            <BarberPicker
              barbers={barbers}
              value={barberId}
              onChange={handleBarberChange}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability-date">Data</Label>
          <Input
            id="availability-date"
            type="date"
            required
            min={shopDate()}
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
            className="max-w-48"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Períodos cadastrados</CardTitle>
          <CardDescription>
            {loading
              ? "Carregando..."
              : periods.length === 0
                ? `Nenhum período nesta data: atendimento das ${OPENING_TIME} às ${CLOSING_TIME}.`
                : "O barbeiro atende somente nos períodos abaixo."}
          </CardDescription>
        </CardHeader>

        {!loading && periods.length > 0 && (
          <CardContent className="flex flex-col gap-3">
            {periods.map((period) => (
              <div
                key={period.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
              >
                <span>
                  {formatShopTime(new Date(period.startsAt))} às{" "}
                  {formatShopTime(new Date(period.endsAt))}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void handleDelete(period)}
                >
                  Excluir
                </Button>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Novo período</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="period-start">Início</Label>
                <Input
                  id="period-start"
                  type="time"
                  step={1800}
                  min={OPENING_TIME}
                  max={CLOSING_TIME}
                  required
                  value={form.start}
                  onChange={(event) => setForm({ ...form, start: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period-end">Fim</Label>
                <Input
                  id="period-end"
                  type="time"
                  step={1800}
                  min={OPENING_TIME}
                  max={CLOSING_TIME}
                  required
                  value={form.end}
                  onChange={(event) => setForm({ ...form, end: event.target.value })}
                />
              </div>
            </div>

            <Button type="submit" disabled={saving || !barberId}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </section>
  );
}
