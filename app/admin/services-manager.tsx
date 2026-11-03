
"use client";

import { useCallback, useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  priceInCents: number;
  durationInMin: number;
  active: boolean;
};

const emptyForm = {
  name: "",
  price: "",
  durationInMin: "",
};

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/services");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar os serviços.");
      }

      setServices(data.services);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao carregar os serviços.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const price = Number(form.price.replace(",", "."));
    const durationInMin = Number(form.durationInMin);

    try {
      const response = await fetch("/api/admin/services", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          name: form.name,
          price,
          durationInMin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível salvar o serviço.");
      }

      setMessage(
        editingId
          ? "Serviço atualizado com sucesso!"
          : "Serviço cadastrado com sucesso!",
      );

      resetForm();
      await loadServices();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro ao salvar o serviço.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(service: Service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      price: (service.priceInCents / 100).toFixed(2),
      durationInMin: String(service.durationInMin),
    });
    setMessage("");
  }

  async function handleToggle(service: Service) {
    setMessage("");

    try {
      const response = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: service.id,
          active: !service.active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível alterar o serviço.");
      }

      setMessage("Status do serviço atualizado!");
      await loadServices();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro ao alterar o serviço.",
      );
    }
  }

  return (
    <section className="mt-10 space-y-8">
      <div>
        <h2 className="font-heading text-2xl tracking-tight">
          Gerenciar serviços
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre e mantenha os serviços oferecidos pela barbearia.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border p-6"
      >
        <h3 className="font-semibold">
          {editingId ? "Editar serviço" : "Cadastrar novo serviço"}
        </h3>

        <div className="space-y-2">
          <label htmlFor="service-name" className="text-sm font-medium">
            Nome do serviço
          </label>
          <input
            id="service-name"
            required
            maxLength={80}
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            placeholder="Ex.: Corte de cabelo"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="service-price" className="text-sm font-medium">
              Preço (R$)
            </label>
            <input
              id="service-price"
              required
              type="text"
              inputMode="decimal"
              value={form.price}
              onChange={(event) =>
                setForm({ ...form, price: event.target.value })
              }
              placeholder="Ex.: 35,00"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service-duration" className="text-sm font-medium">
              Duração (minutos)
            </label>
            <input
              id="service-duration"
              required
              type="number"
              min="1"
              max="600"
              step="1"
              value={form.durationInMin}
              onChange={(event) =>
                setForm({ ...form, durationInMin: event.target.value })
              }
              placeholder="Ex.: 30"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving
              ? "Salvando..."
              : editingId
                ? "Salvar alterações"
                : "Cadastrar serviço"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">Serviços cadastrados</h3>

        {loading ? (
          <p className="text-sm text-muted-foreground">
            Carregando serviços...
          </p>
        ) : services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum serviço cadastrado.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    R$ {(service.priceInCents / 100).toFixed(2)} ·{" "}
                    {service.durationInMin} minutos
                  </p>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      service.active ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    {service.active ? "Ativo" : "Inativo"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(service)}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(service)}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                  >
                    {service.active ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
