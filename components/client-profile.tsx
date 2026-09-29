"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
  createdAt: string;
};

export function ClientProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Não foi possível carregar seus dados.");
        }

        if (active) setProfile(data.user);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar seus dados.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Carregando seus dados...</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!profile) {
    return <p className="text-muted-foreground">Nenhum dado encontrado.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados cadastrados</CardTitle>
        <CardDescription>
          Informações vinculadas à sua conta no BladeApp.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Nome</p>
          <p className="mt-1">{profile.name}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">E-mail</p>
          <p className="mt-1 break-all">{profile.email}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Telefone</p>
          <p className="mt-1">{profile.phone || "Não informado"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Situação da conta</p>
          <p className="mt-1">{profile.active ? "Ativa" : "Inativa"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
