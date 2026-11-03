import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/**
 * Guards a page: anyone without the given role is sent to the login page.
 */
export async function requireRole(role: "ADMIN" | "BARBER") {
  const user = await getCurrentUser();

  if (user?.role !== role) redirect("/login");

  return user;
}
