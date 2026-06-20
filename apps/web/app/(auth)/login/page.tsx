"use client";
// =============================================================================
// app/(auth)/login/page.tsx — Login form (Req 1.4, 1.5)
// After login: ADMIN → /admin, CLIENT → /catalog (or callbackUrl)
// =============================================================================

import { Suspense, useState, useTransition } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Correo o contraseña incorrectos.");
      } else {
        // Get the session to check the user's role
        const session = await getSession();
        const isAdmin = session?.user?.role === "ADMIN";

        // If there's a specific callbackUrl (not default), use it
        // Otherwise redirect based on role
        const destination = callbackUrl || (isAdmin ? "/admin" : "/catalog");
        router.push(destination);
        router.refresh();
      }
    });
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Ingresar</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all focus:border-cerise-300 focus:outline-none focus:ring-2 focus:ring-cerise-100"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-cerise-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cerise-600 hover:shadow-md disabled:opacity-60"
        >
          {isPending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
        <p>
          <Link href="/recuperar-password" className="text-gray-700 underline hover:text-cerise-600">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p>
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-cerise-600 underline hover:text-cerise-700">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
