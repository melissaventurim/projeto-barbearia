"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { BarberOption } from "@/components/admin/barber-picker";
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
import { errorMessage, requestJson } from "@/lib/request-json";

type Barber = BarberOption & { email: string };

const emptyForm = { name: "", email: "", password: "" };

export function BarbersManager() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    requestJson<{ barbers: Barber[] }>("/api/admin/barbers")
      .then((data) => {
        if (active) setBarbers(data.barbers);
      })
      .catch((error) => {
        if (active) setMessage(errorMessage(error, "Erro ao carregar os barbeiros."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function reloadBarbers() {
    const data = await requestJson<{ barbers: Barber[] }>("/api/admin/barbers");
    setBarbers(data.barbers);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (editingId) {
        await requestJson("/api/admin/barbers", {
          method: "PATCH",
          body: { id: editingId, name: form.name, email: form.email },
        });
        setMessage("Barbeiro atualizado.");
      } else {
        await requestJson("/api/admin/barbers", { method: "POST", body: form });
        setMessage("Barbeiro cadastrado.");
      }

      resetForm();
      await reloadBarbers();
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao salvar o barbeiro."));
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(barber: Barber) {
    setEditingId(barber.id);
    setForm({ name: barber.name, email: barber.email, password: "" });
    setMessage("");
  }

  async function handleToggle(barber: Barber) {
    if (
      barber.active &&
      !window.confirm(
        `Desativar ${barber.name}? A conta deixa de acessar o sistema e de receber agendamentos.`,
      )
    ) {
      return;
    }

    setMessage("");

    try {
      await requestJson("/api/admin/barbers", {
        method: "PATCH",
        body: { id: barber.id, active: !barber.active },
      });
      setMessage(barber.active ? "Barbeiro desativado." : "Barbeiro reativado.");
      await reloadBarbers();
    } catch (error) {
      setMessage(errorMessage(error, "Erro ao alterar o barbeiro."));
    }
  }

  return (
    <section className="mt-10 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Barbeiros</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre as contas dos barbeiros e desative quem não atende mais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar barbeiro" : "Novo barbeiro"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barber-name">Nome</Label>
              <Input
                id="barber-name"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barber-email">E-mail</Label>
              <Input
                id="barber-email"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>

            {!editingId && (
              <div className="space-y-2">
                <Label htmlFor="barber-password">Senha inicial</Label>
                <Input
                  id="barber-password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>

              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar edição
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando barbeiros...</p>
      ) : barbers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum barbeiro cadastrado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {barbers.map((barber) => (
            <Card key={barber.id} size="sm">
              <CardHeader>
                <CardTitle>{barber.name}</CardTitle>
                <CardDescription>
                  {barber.email} · {barber.active ? "Ativo" : "Inativo"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(barber)}>
                  Editar
                </Button>
                <Button
                  variant={barber.active ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => void handleToggle(barber)}
                >
                  {barber.active ? "Desativar" : "Ativar"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
