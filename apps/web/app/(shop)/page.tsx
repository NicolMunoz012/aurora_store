export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(shop)/page.tsx — Homepage (Req 4.1)
// Server Component: hero + progressive registration banner for guests.
// =============================================================================

import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Aurora Belleza — Tienda",
  description: "Productos de belleza al mejor precio. IVA incluido.",
};

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-50 to-pink-100 py-20 dark:from-zinc-900 dark:to-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Tu belleza, a un clic
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
            Productos de calidad con precios mayoristas disponibles.
            <span className="ml-1 font-medium text-zinc-800 dark:text-zinc-100">
              IVA incluido en todos los precios.
            </span>
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/catalog"
              className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Progressive registration banner — only for unauthenticated users (Req 4.1) */}
      {!session && (
        <section
          role="complementary"
          aria-label="Beneficios de registrarte"
          className="border-y border-zinc-200 bg-white py-8 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Crea tu cuenta gratis y disfruta de:
                </p>
                <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <li>✓ Seguimiento de tus pedidos</li>
                  <li>✓ Direcciones guardadas para checkout rápido</li>
                  <li>✓ Historial de compras</li>
                </ul>
              </div>
              <div className="flex shrink-0 gap-3 text-sm font-medium">
                <Link
                  href="/registro"
                  className="rounded-full bg-rose-500 px-5 py-2 text-white hover:bg-rose-600"
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-zinc-300 px-5 py-2 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
