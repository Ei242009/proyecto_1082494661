import type { Metadata } from "next";
import { Bricolage_Grotesque, Archivo, Space_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-spacemono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "BusetaApp — Control financiero de tu ruta",
  description: "Liquidación diaria de la buseta: turnos, gastos y comprobante digital. Mobile-first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${archivo.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
