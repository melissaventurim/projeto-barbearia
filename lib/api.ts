import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

/**
 * Error raised by business rules. Its message is safe to show to the user.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export async function getUserWithRole(role: "ADMIN" | "BARBER") {
  const user = await getCurrentUser();
  return user?.role === role ? user : null;
}

export function forbiddenResponse() {
  return NextResponse.json(
    { error: "Acesso não autorizado." },
    { status: 403 },
  );
}

export function errorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
