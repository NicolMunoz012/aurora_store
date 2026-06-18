"use client";
// =============================================================================
// app/(auth)/reset-password/page.tsx — New password form (Req 2.3, 2.4, 2.5)
// Reads ?token= from searchParams. Shows error if token is absent/invalid.
// =============================================================================

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth.actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // No token in URL — show error immediately (Req 2.4)
  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          El enlace de restablecimiento es inválido o ha expirado.
        </p>
        <Link
          href="/recuperar-password"
          className="mt-4 inline-block text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction({ token: token!, newPassword });
      if (result.error) {
        if (
          result.error.code === "INVALID_TOKEN" ||
          result.error.code === "TOKEN_EXPIRED"
        ) {
          setError(
            "El enlace ha expirado o ya fue utilizado. Solicita uno nuevo.",
          );
        } else {
          setError(result.error.message);
        }
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Tu contraseña fue actualizada correctamente.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-white"
        >
          Ingresar
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">
        Nueva contraseña
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Confirmar contraseña
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          {isPending ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
      {error && error.includes("expirado") && (
        <p className="mt-4 text-center text-sm">
          <Link href="/recuperar-password" className="text-zinc-500 underline">
            Solicitar nuevo enlace
          </Link>
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
