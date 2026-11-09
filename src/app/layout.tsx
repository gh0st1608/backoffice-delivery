import type { Metadata } from "next";
import { AppShell } from "@/shared/ui/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foodstore Backoffice",
  description: "Panel de administración de Foodstore.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
