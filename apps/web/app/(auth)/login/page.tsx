"use client";
// =============================================================================
// app/(auth)/login/page.tsx — Login form
// After login: ADMIN → /admin, CLIENT → /catalog (or callbackUrl)
// =============================================================================

import { Suspense, useState, useTransition } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const session = await getSession();
        const isAdmin = session?.user?.role === "ADMIN";
        const destination = callbackUrl || (isAdmin ? "/admin" : "/catalog");
        router.push(destination);
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel — solo desktop */}
      <div className="hidden lg:flex relative bg-blush items-center justify-center p-16">
        <div className="absolute top-8 left-8">
          <Link href="/"><Image src="/aurora.png" alt="Aurora Belleza" width={90} height={28} /></Link>
        </div>
        <div className="text-center max-w-md">
          <span className="text-cerise-600 text-[11px] font-semibold tracking-luxe mb-6 block">
            Tu ritual de belleza
          </span>
          <p className="font-serif text-3xl md:text-4xl leading-snug text-balance italic text-gray-800">
            "La belleza es sentirte bien en tu propia piel."
          </p>
          <p className="text-[11px] tracking-luxe text-gray-400 mt-8 font-medium">
            — Aurora Belleza
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/"><Image src="/aurora.png" alt="Aurora Belleza" width={80} height={26} /></Link>
          </div>
          <div className="mb-6">
            <Link href="/catalog" className="inline-flex items-center gap-1.5 text-[11px] tracking-luxe text-gray-400 hover:text-cerise-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5"><path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z" clipRule="evenodd" /></svg>
              Volver al catálogo
            </Link>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-2">Bienvenida de nuevo.</h1>
          <p className="text-gray-500 text-sm mb-10">Ingresa a tu cuenta Aurora.</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">
                Correo electrónico
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-cerise-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] tracking-luxe font-medium text-gray-500 mb-1.5 block">
                Contraseña
              </label>
              <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-cerise-400 transition-colors [&::-webkit-credentials-auto-fill-button]:hidden [&::-ms-reveal]:hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cerise-600 transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              </div>
            </div>

            {error && (
              <div className="bg-cerise-50 border border-cerise-100 rounded-sm px-4 py-2.5">
                <p className="text-sm text-cerise-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-cerise-600 text-white py-3.5 text-[12px] tracking-luxe font-semibold rounded-sm hover:bg-cerise-700 transition-colors disabled:opacity-60"
            >
              {isPending ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link href="/recuperar-password" className="text-sm text-gray-400 hover:text-cerise-600 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="text-cerise-600 font-medium hover:underline">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
