import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const isStaff = user?.role === "ADMIN" || user?.role === "BARBER";

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="font-heading text-xl tracking-tight">
          BladeApp
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              <span className="text-muted-foreground">{user.name}</span>
              {isStaff && (
                <Link href="/dashboard" className="hover:text-primary">
                  Minha área
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary">
                Entrar
              </Link>
              <Link href="/register" className="hover:text-primary">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
