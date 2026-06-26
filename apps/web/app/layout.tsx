import type { Metadata } from "next";
import { DM_Serif_Display, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "LunaRose",
  description: "Productos de belleza al mejor precio.",
  icons: {
    icon: "/aurora.png",
    apple: "/aurora.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${dmSerifDisplay.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
