import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { SiteHeader } from "@/components/site-header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-heading text-3xl tracking-tight">
          Área do administrador
        </h1>

        <AdminNav />

        {children}
      </main>
    </>
  );
}
