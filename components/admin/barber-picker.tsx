"use client";

import { Button } from "@/components/ui/button";

export type BarberOption = {
  id: string;
  name: string;
  active: boolean;
};

export function BarberPicker({
  barbers,
  value,
  onChange,
  allowAll = false,
}: {
  barbers: BarberOption[];
  value: string;
  onChange: (barberId: string) => void;
  allowAll?: boolean;
}) {
  const options = [
    ...(allowAll ? [{ id: "", label: "Todos" }] : []),
    ...barbers.map((barber) => ({
      id: barber.id,
      label: barber.active ? barber.name : `${barber.name} (inativo)`,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.id || "all"}
          type="button"
          size="sm"
          variant={value === option.id ? "default" : "outline"}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
