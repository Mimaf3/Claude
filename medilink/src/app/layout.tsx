import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Medilink – Gestion de vacations médicales",
  description: "Plateforme de vacations pour professionnels de santé",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
