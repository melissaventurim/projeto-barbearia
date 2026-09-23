"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const result = await signUp.email({ name, email, password, phone });

    setLoading(false);

    if (result.error) {
      setError("Não foi possível criar a conta. Confira os dados.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <p className="text-sm opacity-70">
        Com uma conta você acompanha seus agendamentos e reserva mais rápido.
      </p>

      <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Nome</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded border border-gray-400 p-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded border border-gray-400 p-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Telefone</span>
          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="rounded border border-gray-400 p-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Senha</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded border border-gray-400 p-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </main>
  );
}
