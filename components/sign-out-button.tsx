"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        void signOut().then(() => {
          router.push("/");
          router.refresh();
        });
      }}
      className="text-sm hover:text-primary"
    >
      Sair
    </button>
  );
}
