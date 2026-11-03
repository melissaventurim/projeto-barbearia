"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const tabs = [
  { href: "/admin", label: "Agenda" },
  { href: "/admin/services", label: "Serviços" },
  { href: "/admin/barbers", label: "Barbeiros" },
  { href: "/admin/availability", label: "Horários" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.href}
          asChild
          variant={pathname === tab.href ? "default" : "outline"}
        >
          <Link href={tab.href}>{tab.label}</Link>
        </Button>
      ))}
    </nav>
  );
}
