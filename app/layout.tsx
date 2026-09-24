import type { Metadata } from "next";
import { Archivo, Bevan } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const bevan = Bevan({
  variable: "--font-bevan",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BladeApp",
  description: "Agendamento online de barbearia",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${archivo.variable} ${bevan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
