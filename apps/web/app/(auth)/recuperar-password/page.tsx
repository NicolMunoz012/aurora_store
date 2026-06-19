"use client";
// =============================================================================
// app/(auth)/recuperar-password/page.tsx — Password reset request (Req 2.1, 2.2)
// Always shows same confirmation to avoid email enumeration.
// =============================================================================

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/actions/auth.actions";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      // Always show same confirmation regardless of whether email exists (Req 2.2)
      await requestPasswordResetAction(email);
      setSubmitted(true);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
          Recuperar contraseña
        </h1>

        {submitted ? (
          <div className="mt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Si el correo está registrado, recibirás un enlace para restablecer
              tu contraseña.
            </p>
            <Link
              href="/login"
              className="mt-6 block text-center text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
            >
              Volver a ingresar
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu
              contraseña.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
              >
                {isPending ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm">
              <Link href="/login" className="text-zinc-500 underline dark:text-zinc-400">
                Volver a ingresar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
