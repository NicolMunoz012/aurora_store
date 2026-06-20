import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aurora Belleza — Tienda de cosméticos",
  description:
    "Productos de belleza al mejor precio. IVA incluido en todos los precios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lora.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-neutral-50 font-display antialiased">
        {children}
      </body>
    </html>
  );
}
